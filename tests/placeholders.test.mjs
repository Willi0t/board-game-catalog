import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildSync } from 'esbuild';
import games from '../src/games.json' with { type: 'json' };
import manifest from '../src/data/placeholder-manifest.json' with { type: 'json' };

const bundle = buildSync({
  stdin: {
    contents: `export * from './src/constants/placeholderThemes'; export * from './src/utils/gameImages'; export * from './src/utils/coverTitle';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  write: false,
}).outputFiles[0].text;
const mod = { exports: {} };
new Function('module', 'exports', bundle)(mod, mod.exports);
const {
  resolvePlaceholderTheme,
  resolveGameColors,
  getCoverImage,
  getHeroImage,
  getGalleryImages,
  layoutCoverTitle,
} = mod.exports;

test('72 themes / 216 files, proportional geometry and 71 unique valid mappings', () => {
  assert.equal(Object.keys(manifest.themes).length, 72);
  assert.equal(Object.keys(manifest.games).length, 71);
  assert(manifest.themes[manifest.defaultTheme]);
  for (const [id, key] of Object.entries(manifest.games)) {
    assert.equal(games.filter((game) => game.id === id).length, 1, id);
    assert(manifest.themes[key], key);
  }
  const unmapped = games.filter((game) => !manifest.games[game.id]);
  if (unmapped.length)
    console.log(
      'Unmapped catalog entries use existing theme/default:',
      unmapped.map((game) => game.id),
    );
  for (const theme of Object.values(manifest.themes)) {
    const geometry = [];
    for (const [kind, dimensions] of [
      ['cover', '600 760'],
      ['scene', '1600 640'],
      ['detail', '960 720'],
    ]) {
      const file = `public${theme[kind]}`;
      assert(fs.existsSync(file), file);
      const svg = fs.readFileSync(file, 'utf8');
      assert(svg.includes(`viewBox="0 0 ${dimensions}"`));
      assert(!/<text|preserveAspectRatio="none"|scaleX|scaleY/.test(svg));
      const group = svg.match(
        /<g\b[^>]*transform="translate\([^)]+\) scale\([\d.]+\)"[^>]*>([\s\S]*)<\/g>/,
      );
      assert(group, file);
      geometry.push(group[1]);
    }
    assert.equal(geometry[0], geometry[1]);
    assert.equal(geometry[1], geometry[2]);
  }
});

test('mapping, valid v2 key, legacy-only key, then default; primary images remain first', () => {
  const game = games[0];
  assert.equal(
    resolvePlaceholderTheme({ ...game, placeholderTheme: 'planet-gold' }).cover,
    manifest.themes[manifest.games[game.id]].cover,
  );
  assert.equal(
    resolvePlaceholderTheme({
      ...game,
      id: 'new-id',
      placeholderTheme: 'cards-teal',
    }).cover,
    manifest.themes['cards-teal'].cover,
  );
  assert.equal(
    resolvePlaceholderTheme({
      ...game,
      id: 'new-id',
      placeholderTheme: 'planet-rust',
    }).cover,
    '/images/placeholders/planet/rust/cover.svg',
  );
  assert.equal(
    resolvePlaceholderTheme({
      ...game,
      id: 'new-id',
      placeholderTheme: 'unknown',
    }).cover,
    manifest.themes[manifest.defaultTheme].cover,
  );
  const real = {
    ...game,
    cover: '/local/cover.png',
    hero: '/local/hero.jpg',
    gallery: [{ src: '/local/detail.webp', alt: 'Own photo' }],
  };
  assert.equal(getCoverImage(real).src, real.cover);
  assert.equal(getHeroImage(real).src, real.hero);
  assert.equal(getGalleryImages(real)[0].src, '/local/detail.webp');
  assert.equal(getGalleryImages(real)[0].alt, 'Own photo');
  assert.equal(
    getGalleryImages(game)[1].placeholderSrc,
    manifest.themes[manifest.games[game.id]].detail,
  );
});

test('palette policy preserves personal colors, only changes imported default and does not mutate data', () => {
  const snapshot = JSON.stringify(games);
  for (const game of games) {
    const colors = resolveGameColors(game);
    if (
      game.id === 'burgundy' ||
      game.accent !== '#815467' ||
      game.tint !== '#eadce2' ||
      !game.catalogMetadata
    )
      assert.deepEqual(colors, { accent: game.accent, tint: game.tint });
    else {
      const theme = manifest.themes[manifest.games[game.id]];
      assert.deepEqual(colors, { accent: theme.accent, tint: theme.tint });
    }
  }
  assert.equal(JSON.stringify(games), snapshot);
});

test('cover titles keep all words and fit the reserved vertical area', () => {
  for (const game of games) {
    const result = layoutCoverTitle(game.title);
    assert.equal(result.lines.join(' '), game.title);
    assert(result.firstY > 0);
    assert(result.firstY + (result.lines.length - 1) * result.lineHeight < 180);
  }
  assert(
    layoutCoverTitle("Andromeda's Edge + Genesis (Fully Operational)").lines
      .length > 1,
  );
});
