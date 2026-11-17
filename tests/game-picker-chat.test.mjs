import assert from 'node:assert/strict';
import { scryptSync } from 'node:crypto';
import test from 'node:test';
import handler from '../netlify/functions/game-picker.mjs';

test('picker chat requires a valid session before using the API', async (t) => {
  const password = 'test-only-password';
  const salt = Buffer.alloc(16, 1);
  const hash = scryptSync(password, salt, 32, {
    N: 65536,
    r: 8,
    p: 1,
    maxmem: 96 * 1024 * 1024,
  });
  process.env.GAME_PICKER_PASSWORD_HASH = `${salt.toString('hex')}:${hash.toString('hex')}`;
  process.env.GAME_PICKER_SESSION_SECRET =
    'test-session-signing-key-not-for-production';
  process.env.OPENAI_API_KEY = 'dummy-test-key';

  const origin = 'https://catalog.example';
  const call = (body, cookie = '', from = origin) =>
    handler(
      new Request(origin + '/api/game-picker', {
        method: 'POST',
        headers: { origin: from, 'content-type': 'application/json', cookie },
        body: JSON.stringify(body),
      }),
    );
  const chat = {
    action: 'chat',
    messages: [{ role: 'user', content: 'Vi är två.' }],
  };
  const fetch = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({
      output: [
        {
          content: [
            {
              type: 'output_text',
              text: JSON.stringify({
                reply: 'Prova ett strategispel.',
                gameIds: ['burgundy'],
              }),
            },
          ],
        },
      ],
    }),
  );

  assert.equal((await call(chat)).status, 401);
  assert.equal(
    (await call({ action: 'unlock', password: 'wrong' })).status,
    401,
  );
  assert.equal(fetch.mock.callCount(), 0);

  const unlock = await call({ action: 'unlock', password });
  assert.equal(unlock.status, 200);
  const setCookie = unlock.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly; Secure; SameSite=Strict/);
  const cookie = setCookie.split(';')[0];
  const invalidCookie =
    cookie.slice(0, -1) + (cookie.endsWith('0') ? '1' : '0');
  assert.equal((await call(chat, invalidCookie)).status, 401);
  assert.equal((await call(chat, cookie, 'https://other.example')).status, 403);
  assert.equal(
    (await call({ action: 'chat', messages: [] }, cookie)).status,
    400,
  );
  assert.equal(fetch.mock.callCount(), 0);
  assert.deepEqual(await (await call({ action: 'status' }, cookie)).json(), {
    unlocked: true,
  });

  const response = await call(chat, cookie);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).titles[0], 'The Castles of Burgundy');
  const [, options] = fetch.mock.calls[0].arguments;
  assert.equal(JSON.parse(options.body).store, false);
  assert.ok(!options.body.includes(password));
});
