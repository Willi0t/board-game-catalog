import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transpileModule, ModuleKind } from 'typescript';
import {
  mergeCatalog,
  normalizeGameTypes,
} from '../scripts/import-catalog.mjs';
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

test('71 explicit unique matches, exact approved fields and 21 upcoming games', () => {
  assert.equal(source.games.length, 71);
  assert.equal(new Set(games.map((game) => game.id)).size, games.length);
  assert.equal(new Set(matches.map((match) => match.id)).size, 71);
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
  assert.equal(games.filter((game) => game.upcoming === true).length, 21);
  assert.equal(
    games.find((game) => game.id === 'terraforming').upcoming,
    false,
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
  assert.equal(filterGames(games, { availability: 'upcoming' }).length, 21);
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

test('Party aliases normalize without duplicates or removing existing types', () => {
  assert.deepEqual(
    normalizeGameTypes([
      'Competitive',
      'party',
      'paty',
      'Party',
      'Racing',
      'Team-based',
    ]),
    ['Competitive', 'Party', 'Racing', 'Team-based'],
  );
  const party = filterGames(games, { gameType: 'Party' });
  assert(party.length >= 13);
  assert(party.every((game) => game.gameTypes.includes('Party')));
});

test('Terraforming Mars updates the stable entry with approved facts and null interaction', () => {
  const entries = games.filter((game) => game.id === 'terraforming');
  assert.equal(entries.length, 1);
  const game = entries[0];
  assert.equal(game.title, 'Terraforming Mars');
  assert.equal(game.playersMin, 1);
  assert.equal(game.playersMax, 5);
  assert.equal(game.bestWith, '3');
  assert.equal(game.weight, 3.27);
  assert.equal(game.playerInteraction, null);
  assert.deepEqual(game.mechanics, [
    'Engine building',
    'Hand management',
    'Tile placement',
  ]);
  assert.deepEqual(game.gameTypes, ['Competitive']);
  assert.equal(game.upcoming, false);
  assert(
    filterGames(games, { availability: 'owned', players: '5' }).includes(game),
  );
  const hitman = games.find((game) => game.id === 'hitman-the-board-game');
  assert.equal(hitman.upcoming, true);
  assert(!filterGames(games, { availability: 'owned' }).includes(hitman));
  assert(filterGames(games, { availability: 'upcoming' }).includes(hitman));
});

test('source numbering inserts game 12 on row 13 and identities survive reordered input', () => {
  assert.equal(source.source.range, 'A1:H72');
  assert.equal(source.games[11].title, 'Terraforming Mars');
  assert.equal(source.games[11].sourceRow, 13);
  assert.equal(source.games[12].title, 'Solar Titans');
  for (let index = 0; index < source.games.length; index++)
    assert.equal(source.games[index].sourceRow, index + 2);
  assert.deepEqual(
    mergeCatalog(games, { ...source, games: [...source.games].reverse() }),
    games,
  );
  assert.throws(() =>
    mergeCatalog(games, {
      ...source,
      games: source.games.map((row) =>
        row.title === 'Terraforming Mars' ? { ...row, sourceRow: 14 } : row,
      ),
    }),
  );
  const local = games.find((game) => game.id === 'terraforming');
  const retained = {
    ...local,
    description: 'Behåll mitt utkast',
    cover: '/images/local.webp',
    hero: '/images/scene.png',
    placeholderTheme: 'planet-gold',
    accent: '#123456',
    tint: '#abcdef',
  };
  const updated = mergeCatalog([retained], source).find(
    (game) => game.id === 'terraforming',
  );
  for (const key of [
    'id',
    'description',
    'cover',
    'hero',
    'placeholderTheme',
    'accent',
    'tint',
  ])
    assert.deepEqual(updated[key], retained[key]);
});
