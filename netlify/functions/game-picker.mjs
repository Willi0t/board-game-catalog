import { Buffer } from 'node:buffer';
import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';
import { env } from 'node:process';
import games from '../../src/games.json' with { type: 'json' };

export const config = {
  path: '/api/game-picker',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

const cookieName = '__Host-game-picker';
const sessionSeconds = 3600;
const passwordOptions = { N: 65536, r: 8, p: 1, maxmem: 96 * 1024 * 1024 };
const gamesById = new Map(games.map(({ id, title }) => [id, title]));
const catalogFields = [
  'id',
  'title',
  'playersMin',
  'playersMax',
  'minutes',
  'weight',
  'playerInteraction',
  'bestWith',
  'upcoming',
  'mechanics',
  'gameTypes',
  'description',
];
const catalog = JSON.stringify({
  fields: catalogFields,
  games: games.map((game) => catalogFields.map((field) => game[field] ?? null)),
});

function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers },
  });
}

function signature(expires, secret, passwordHash) {
  return createHmac('sha256', secret)
    .update(`game-picker:${expires}:${passwordHash}`)
    .digest('hex');
}

function authorized(request, secret, passwordHash) {
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(cookieName + '='));
  const match = cookie
    ?.slice(cookieName.length + 1)
    .match(/^(\d{10})\.([a-f\d]{64})$/);
  if (!match || Number(match[1]) <= Math.floor(Date.now() / 1000)) return false;
  return timingSafeEqual(
    Buffer.from(match[2], 'hex'),
    Buffer.from(signature(match[1], secret, passwordHash), 'hex'),
  );
}

function validMessages(messages) {
  return (
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.length <= 9 &&
    messages.length % 2 === 1 &&
    messages.every(
      (message, index) =>
        message &&
        message.role === (index % 2 === 0 ? 'user' : 'assistant') &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0 &&
        message.content.length <= (message.role === 'user' ? 600 : 1400),
    )
  );
}

export default async function handler(request) {
  if (request.method !== 'POST') return json({}, 405, { Allow: 'POST' });
  if (
    request.headers.get('origin') !== new URL(request.url).origin ||
    !request.headers.get('content-type')?.startsWith('application/json')
  )
    return json({}, 403);

  const apiKey = env.GROQ_API_KEY;
  const passwordHash = env.GAME_PICKER_PASSWORD_HASH;
  const secret = env.GAME_PICKER_SESSION_SECRET;
  const hash = passwordHash?.match(/^([a-f\d]{32}):([a-f\d]{64})$/);
  if (!apiKey || !hash || !secret || secret.length < 32) return json({}, 503);

  let body;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 24000) return json({}, 413);
    body = JSON.parse(raw);
  } catch {
    return json({}, 400);
  }

  if (body?.action === 'unlock') {
    if (
      typeof body.password !== 'string' ||
      !body.password ||
      body.password.length > 128
    )
      return json({}, 400);
    const attempt = scryptSync(
      body.password,
      Buffer.from(hash[1], 'hex'),
      32,
      passwordOptions,
    );
    if (!timingSafeEqual(attempt, Buffer.from(hash[2], 'hex')))
      return json({}, 401);
    const expires = Math.floor(Date.now() / 1000) + sessionSeconds;
    return json({}, 200, {
      'Set-Cookie': `${cookieName}=${expires}.${signature(expires, secret, passwordHash)}; Max-Age=${sessionSeconds}; Path=/; HttpOnly; Secure; SameSite=Strict`,
    });
  }

  if (body?.action === 'status')
    return json({ unlocked: authorized(request, secret, passwordHash) });
  if (body?.action !== 'chat') return json({}, 400);
  if (!authorized(request, secret, passwordHash)) return json({}, 401);
  if (!validMessages(body.messages)) return json({}, 400);

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          reasoning_effort: 'low',
          max_completion_tokens: 800,
          messages: [
            {
              role: 'system',
              content: `Du hjälper användaren att välja brädspel ur Spelhyllan. Svara kort på svenska. Ställ en följdfråga om spelarantal eller andra viktiga krav saknas. Använd bara katalogen nedan. Respektera spelarantal, tid och tillgänglighet. Behandla okända värden som okända. Föreslå högst tre spel, och ta bara med kommande spel om användaren vill se dem. Förklara kort varför förslagen passar. Använd gameIds för de föreslagna spelen och en tom lista vid följdfrågor. Katalog med kolumnnamn följda av spelrader: ${catalog}`,
            },
            ...body.messages.map(({ role, content }) => ({ role, content })),
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'game_picker',
              strict: true,
              schema: {
                type: 'object',
                additionalProperties: false,
                required: ['reply', 'gameIds'],
                properties: {
                  reply: { type: 'string' },
                  gameIds: {
                    type: 'array',
                    items: { type: 'string', enum: [...gamesById.keys()] },
                  },
                },
              },
            },
          },
        }),
      },
    );
    if (response.status === 429) return json({}, 429);
    if (!response.ok) return json({}, 502);
    const result = await response.json();
    const output = result.choices?.[0]?.message?.content;
    const { reply, gameIds } = JSON.parse(output ?? '{}');
    if (
      typeof reply !== 'string' ||
      !reply.trim() ||
      !Array.isArray(gameIds) ||
      gameIds.some((id) => !gamesById.has(id))
    )
      return json({}, 502);
    const titles = [...new Set(gameIds)]
      .slice(0, 3)
      .map((id) => gamesById.get(id));
    return json({ reply: reply.trim().slice(0, 1400), titles });
  } catch {
    return json({}, 502);
  }
}
