import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { format, resolveConfig } from 'prettier';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

function toHsl([red, green, blue]) {
  const [r, g, b] = [red, green, blue].map((v) => v / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const delta = max - min,
    lightness = (max + min) / 2;
  let hue = 0;
  if (delta) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
  }
  return [
    (hue * 60 + 360) % 360,
    delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0,
    lightness,
  ];
}

function hexFromHsl(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const rgb =
    hue < 60
      ? [chroma, x, 0]
      : hue < 120
        ? [x, chroma, 0]
        : hue < 180
          ? [0, chroma, x]
          : hue < 240
            ? [0, x, chroma]
            : hue < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];
  return (
    '#' +
    rgb
      .map((v) =>
        Math.round((v + lightness - chroma / 2) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

function luminance(hex) {
  const linear = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

export function contrast(first, second) {
  const a = luminance(first),
    b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function themeFromPixels(pixels) {
  const bins = Array.from({ length: 24 }, () => ({
    weight: 0,
    rgb: [0, 0, 0],
  }));
  for (let i = 0; i < pixels.length; i += 4) {
    const rgb = [...pixels.subarray(i, i + 3)];
    const [h, s, l] = toHsl(rgb);
    // Alpha squared rejects invisible ink; saturation suppresses logos/greys.
    // Extreme lightness is tapered rather than abruptly discarded.
    const weight =
      (pixels[i + 3] / 255) ** 2 *
      (0.01 + s ** 2) *
      Math.min(1, l / 0.18, (1 - l) / 0.18) ** 2;
    const bin = bins[Math.floor(h / 15)];
    bin.weight += weight;
    rgb.forEach((v, c) => {
      bin.rgb[c] += v * weight;
    });
  }
  const winner = bins.reduce(
    (best, bin, i) => (bin.weight > bins[best].weight ? i : best),
    0,
  );
  if (bins[winner].weight < 1e-8)
    throw new Error(
      'Omslaget saknar synliga pixlar med användbar kulör. Ingen ändring gjord.',
    );
  // Merge adjacent hue buckets so a colour near a bucket edge stays representative.
  const selected = [
    bins[(winner + 23) % 24],
    bins[winner],
    bins[(winner + 1) % 24],
  ];
  const total = selected.reduce((sum, bin) => sum + bin.weight, 0);
  const rgb = [0, 1, 2].map(
    (c) => selected.reduce((sum, bin) => sum + bin.rgb[c], 0) / total,
  );
  const [h, s] = toHsl(rgb);
  const saturation = s < 0.1 ? s : Math.min(0.7, Math.max(0.35, s));
  const tint = hexFromHsl(h, Math.min(saturation, 0.5), 0.93);
  const backgrounds = [tint, '#ffffff', '#faf9f7', '#fbfaf8', '#f7f4f0'];
  let accent;
  for (let step = 0; step <= 80; step++) {
    accent = hexFromHsl(h, saturation, 0.4 - step * 0.005);
    if (backgrounds.every((bg) => contrast(accent, bg) >= 4.8)) break;
  }
  return { accent, tint };
}

export async function suggestTheme(game, root = projectRoot) {
  const cover = game.cover?.trim();
  if (
    !cover ||
    !cover.startsWith('/images/') ||
    cover.includes('\\') ||
    /[?#]/.test(cover)
  )
    throw new Error(
      `${game.id}: saknar ett riktigt lokalt omslag i cover. Ingen ändring gjord.`,
    );
  const publicRoot = await fs.realpath(path.join(root, 'public'));
  let filename;
  try {
    filename = await fs.realpath(path.resolve(publicRoot, `.${cover}`));
  } catch {
    throw new Error(
      `${game.id}: omslaget ${cover} saknas eller går inte att läsa. Ingen ändring gjord.`,
    );
  }
  const relative = path.relative(publicRoot, filename);
  if (
    relative.startsWith('..') ||
    path.isAbsolute(relative) ||
    relative.split(path.sep).includes('placeholders') ||
    !/\.(png|jpe?g|webp)$/i.test(filename)
  )
    throw new Error(
      `${game.id}: cover måste vara ett riktigt PNG-, JPEG- eller WebP-omslag under public/images. Ingen ändring gjord.`,
    );
  try {
    // Buffer input avoids libvips keeping the source file locked on Windows.
    const image = sharp(await fs.readFile(filename), {
      failOn: 'warning',
      limitInputPixels: 40_000_000,
    });
    const metadata = await image.metadata();
    if (!['png', 'jpeg', 'webp'].includes(metadata.format))
      throw new Error('Bildformatet stöds inte');
    const pixels = await image
      .rotate()
      .resize({
        width: 192,
        height: 192,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toColourspace('srgb')
      .ensureAlpha()
      .raw()
      .toBuffer();
    return themeFromPixels(pixels);
  } catch (error) {
    throw new Error(
      `${game.id}: kunde inte analysera omslaget: ${error.message}. Ingen ändring gjord.`,
      { cause: error },
    );
  }
}

export async function run(args, root = projectRoot) {
  const ids = args.filter((arg) => !arg.startsWith('--'));
  if (
    ids.length !== 1 ||
    args.some((arg) => arg.startsWith('--') && arg !== '--write') ||
    args.filter((arg) => arg === '--write').length > 1
  )
    throw new Error(
      'Användning: node scripts/cover-theme.mjs <spel-id> [--write]',
    );
  const filename = path.join(root, 'src/games.json');
  const original = await fs.readFile(filename, 'utf8');
  const games = JSON.parse(original);
  const matches = games.filter((game) => game.id === ids[0]);
  if (matches.length !== 1)
    throw new Error(
      `Spel-id ${ids[0]} saknas eller är inte unikt. Ingen ändring gjord.`,
    );
  const game = matches[0];
  const colors = await suggestTheme(game, root);
  console.log(
    `${game.title} (${game.id})\naccent: ${colors.accent}\ntint:   ${colors.tint}\nKontrast accent/tint: ${contrast(colors.accent, colors.tint).toFixed(2)}:1; vit text/accent: ${contrast('#ffffff', colors.accent).toFixed(2)}:1`,
  );
  if (args.includes('--write')) {
    Object.assign(game, colors);
    const content = await format(JSON.stringify(games), {
      ...(await resolveConfig(filename)),
      parser: 'json',
      endOfLine: original.includes('\r\n') ? 'crlf' : 'lf',
    });
    if ((await fs.readFile(filename, 'utf8')) !== original)
      throw new Error(
        'Speldata ändrades under analysen. Kör igen; ingen ändring gjord.',
      );
    await fs.writeFile(filename, content);
    console.log('Sparat accent och tint i src/games.json.');
  } else
    console.log('Förslag; ingen fil ändrad. Lägg till --write för att spara.');
  return colors;
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    await run(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
