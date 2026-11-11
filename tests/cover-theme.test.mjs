import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { buildSync } from 'esbuild';
import {
  contrast,
  themeFromPixels,
  suggestTheme,
  run,
} from '../scripts/cover-theme.mjs';
import { mergeCatalog } from '../scripts/import-catalog.mjs';
import source from './fixtures/catalog-source.json' with { type: 'json' };
import games from '../src/games.json' with { type: 'json' };

test('colour weighting resists logos, grey, black and transparency; repeatable accessible palette', () => {
  const pixels = Buffer.from([
    ...Array(10).fill([30, 120, 210, 255]).flat(),
    ...Array(100).fill([255, 255, 255, 255]).flat(),
    ...Array(100).fill([128, 128, 128, 255]).flat(),
    ...Array(100).fill([0, 0, 0, 255]).flat(),
    ...Array(100).fill([255, 0, 0, 0]).flat(),
  ]);
  const theme = themeFromPixels(pixels);
  assert.deepEqual(themeFromPixels(pixels), theme);
  assert(
    parseInt(theme.accent.slice(5, 7), 16) >
      parseInt(theme.accent.slice(1, 3), 16),
  );
  for (const bg of [theme.tint, '#ffffff', '#faf9f7', '#fbfaf8', '#f7f4f0'])
    assert(contrast(theme.accent, bg) >= 4.5);
  assert.throws(
    () => themeFromPixels(Buffer.from([255, 0, 0, 0])),
    /synliga pixlar/,
  );
  const neutral = themeFromPixels(Buffer.from([128, 128, 128, 255]));
  assert(contrast(neutral.accent, neutral.tint) >= 4.5);
});

test('PNG, JPEG, WebP, preview/write boundaries and failed inputs leave data intact', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'spelhyllan-theme-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, 'src'), { recursive: true });
  const directory = path.join(root, 'public/images/games/sample');
  await fs.mkdir(directory, { recursive: true });
  const game = {
    id: 'sample',
    title: 'Sample',
    accent: '#815467',
    tint: '#eadce2',
    cover: '/images/games/sample/cover.png',
    hero: '/images/keep.png',
    gallery: ['/images/keep.webp'],
  };
  const datafile = path.join(root, 'src/games.json');
  const original =
    JSON.stringify(
      [game, { id: 'unchanged', accent: '#123456', tint: '#eeeeee' }],
      null,
      2,
    ) + '\n';
  await fs.writeFile(datafile, original);
  for (const extension of ['png', 'jpeg', 'webp']) {
    await sharp({
      create: {
        width: 24,
        height: 24,
        channels: 4,
        background: { r: 30, g: 120, b: 210, alpha: 1 },
      },
    })
      .toFormat(extension)
      .toFile(path.join(directory, `cover.${extension}`));
    const input = { ...game, cover: `/images/games/sample/cover.${extension}` };
    assert.deepEqual(
      await suggestTheme(input, root),
      await suggestTheme(input, root),
    );
  }
  await run(['sample'], root);
  assert.equal(await fs.readFile(datafile, 'utf8'), original);
  const colors = await run(['sample', '--write'], root);
  const expected = JSON.parse(original);
  Object.assign(expected[0], colors);
  assert.deepEqual(JSON.parse(await fs.readFile(datafile, 'utf8')), expected);
  const written = await fs.readFile(datafile, 'utf8');
  await run(['sample', '--write'], root);
  assert.equal(await fs.readFile(datafile, 'utf8'), written);
  for (const cover of [
    undefined,
    'https://example.org/cover.png',
    '/images/placeholders/demo.svg',
    '/images/games/sample/missing.png',
    '/images/../../outside.png',
  ]) {
    await fs.writeFile(datafile, JSON.stringify([{ ...game, cover }]));
    const snapshot = await fs.readFile(datafile, 'utf8');
    await assert.rejects(run(['sample', '--write'], root));
    assert.equal(await fs.readFile(datafile, 'utf8'), snapshot);
  }
  await fs.writeFile(path.join(directory, 'cover.png'), 'broken image');
  await assert.rejects(suggestTheme(game, root), /kunde inte analysera/);
  await assert.rejects(run(['missing'], root), /saknas/);
  await assert.rejects(run(['sample', '--unknown'], root), /Användning/);
});

test('saved cover colours pass through theme resolution and catalog re-import for any id', () => {
  const bundle = buildSync({
    entryPoints: ['src/constants/placeholderThemes.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
  }).outputFiles[0].text;
  const mod = { exports: {} };
  new Function('module', 'exports', bundle)(mod, mod.exports);
  const colors = themeFromPixels(Buffer.from([30, 120, 210, 255]));
  for (const id of ['burgundy', 'terraforming', 'cosmic']) {
    const modified = games.map((game) =>
      game.id === id ? { ...game, ...colors } : game,
    );
    const game = modified.find((game) => game.id === id);
    assert.deepEqual(mod.exports.resolveGameColors(game), colors);
    const imported = mergeCatalog(modified, source).find(
      (game) => game.id === id,
    );
    assert.equal(imported.accent, colors.accent);
    assert.equal(imported.tint, colors.tint);
  }
  const placeholder = games.find((game) => game.id === 'terraforming');
  const before = mod.exports.resolveGameColors(placeholder);
  const reimported = mergeCatalog(games, source).find(
    (game) => game.id === 'terraforming',
  );
  assert.deepEqual(mod.exports.resolveGameColors(reimported), before);
});
