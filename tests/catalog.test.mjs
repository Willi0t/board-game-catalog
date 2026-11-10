import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transpileModule, ModuleKind } from 'typescript';
import { mergeCatalog } from '../scripts/import-catalog.mjs';
import matches from '../scripts/catalog-matches.json' with { type: 'json' };
import source from './fixtures/catalog-source.json' with { type: 'json' };
import games from '../src/games.json' with { type: 'json' };

const code = transpileModule(
  fs.readFileSync('src/utils/filterGames.ts', 'utf8'),
  { compilerOptions: { module: ModuleKind.ESNext } },
).outputText;
const { default: filterGames } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
);

test('70 explicit unique matches, exact approved fields and 20 upcoming games', () => {
  assert.equal(source.games.length, 70);
  assert.equal(new Set(games.map((game) => game.id)).size, games.length);
  assert.equal(new Set(matches.map((match) => match.id)).size, 70);
  for (const row of source.games) {
    const match = matches.find(
      (match) =>
        match.sourceRow === row.sourceRow && match.sourceTitle === row.title,
    );
    assert(match, row.title);
    const entries = games.filter((game) => game.id === match.id);
    assert.equal(entries.length, 1, row.title);
    const game = entries[0];
    for (const field of [
      'playersMin',
      'playersMax',
      'bestWith',
      'weight',
      'playerInteraction',
      'mechanics',
      'gameTypes',
      'upcoming',
    ])
      assert.deepEqual(game[field], row[field], `${row.title}: ${field}`);
    assert.equal(game.catalogMetadata.sourceTitle, row.title);
  }
  assert.equal(games.filter((game) => game.upcoming === true).length, 20);
  assert.equal(
    games.find((game) => game.id === 'terraforming').upcoming,
    undefined,
  );
  assert.equal(
    games.find((game) => game.title === 'Fate of the Fellowship').bestWith,
    '1–3',
  );
  assert.equal(
    games.find((game) => game.title === 'Parlay').catalogMetadata.editionMatch,
    'provisional',
  );
  assert.equal(
    games.filter((game) => game.gameTypes.includes('Solo')).length,
    1,
  );
  assert(
    games.every(
      (game) =>
        !Object.hasOwn(game, 'notes') && !Object.hasOwn(game, 'notering'),
    ),
  );
});

test('re-import is idempotent and preserves local identity, art and descriptions', () => {
  assert.deepEqual(mergeCatalog(games, source), games);
  const existing = {
    ...games.find((game) => game.id === 'burgundy'),
    description: 'Local draft',
    cover: '/images/local.webp',
    accent: '#123456',
    tint: '#abcdef',
    placeholderTheme: 'planet-gold',
  };
  const imported = mergeCatalog([existing], source).find(
    (game) => game.id === 'burgundy',
  );
  for (const field of [
    'id',
    'description',
    'cover',
    'accent',
    'tint',
    'placeholderTheme',
    'edition',
  ])
    assert.deepEqual(imported[field], existing[field]);
  assert.throws(() =>
    mergeCatalog([], {
      ...source,
      games: source.games.map((row, index) =>
        index === 0 ? { ...row, title: 'Unexpected title' } : row,
      ),
    }),
  );
  assert.notEqual(
    matches.find((match) => match.sourceTitle === '7 Wonders').id,
    matches.find((match) => match.sourceTitle === '7 Wonders Duel').id,
  );
  assert.equal(games.filter((game) => game.id.startsWith('nemesis')).length, 2);
  assert.equal(
    games.filter((game) => game.id.startsWith('ascension')).length,
    2,
  );
});

test('zero interaction survives, unknown times sort last and never match time filters', () => {
  assert.equal(games.filter((game) => game.playerInteraction === 0).length, 2);
  const unknown = {
    ...games[0],
    id: 'unknown',
    minutes: null,
    playersMin: null,
    playersMax: null,
  };
  const long = { ...games[0], id: 'long', minutes: 90 };
  const short = { ...games[0], id: 'short', minutes: 30 };
  const fixture = Object.freeze([unknown, long, short]);
  assert.deepEqual(
    filterGames(fixture, { sort: 'time' }).map((game) => game.id),
    ['short', 'long', 'unknown'],
  );
  assert.deepEqual(
    filterGames(fixture, { duration: '60' }).map((game) => game.id),
    ['short'],
  );
  assert(!filterGames(fixture, { players: '2' }).includes(unknown));
  assert.deepEqual(
    fixture.map((game) => game.id),
    ['unknown', 'long', 'short'],
  );
});

test('simultaneous filters, favorites, tag search and unknown availability', () => {
  const result = filterGames(games, {
    mechanic: 'Deckbuilding',
    gameType: 'Competitive',
    availability: 'owned',
    players: '2',
    query: 'deckbuilding',
  });
  assert(result.length > 0);
  assert(
    result.every(
      (game) =>
        game.mechanics.includes('Deckbuilding') &&
        game.gameTypes.includes('Competitive') &&
        game.upcoming === false &&
        game.playersMin <= 2 &&
        game.playersMax >= 2,
    ),
  );
  assert.equal(filterGames(games, { availability: 'upcoming' }).length, 20);
  assert.equal(filterGames(games, { availability: 'owned' }).length, 50);
  assert.deepEqual(
    filterGames(games, {
      category: 'Favoriter',
      favorites: ['burgundy', 'agricola'],
      availability: 'owned',
    }).map((game) => game.id),
    ['burgundy'],
  );
  assert.equal(filterGames(games, { duration: '30' }).length, 0);
  assert.equal(filterGames(games, { query: 'no-such-game' }).length, 0);
});
