import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transpileModule, ModuleKind } from 'typescript';
import games from '../src/games.json' with { type: 'json' };

async function utility(file) {
  const code = transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ModuleKind.ESNext },
  }).outputText;
  return (
    await import(
      `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
    )
  ).default;
}
const getTagCounts = await utility('src/utils/getTagCounts.ts');
const filterGames = await utility('src/utils/filterGames.ts');
const getTagColor = await utility('src/utils/getTagColor.ts');

test('tag counts use unique game identities, omit empty tags and include upcoming entries', () => {
  const pool = [
    {
      ...games[0],
      id: 'a',
      gameTypes: ['Party', 'Party', 'Competitive', ''],
      upcoming: false,
    },
    {
      ...games[0],
      id: 'a',
      gameTypes: ['Party', 'Competitive'],
      upcoming: false,
    },
    { ...games[0], id: 'b', gameTypes: ['Party', '   '], upcoming: true },
  ];
  const before = JSON.stringify(pool);
  assert.deepEqual(getTagCounts(pool, 'gameTypes'), [
    { tag: 'Party', count: 2 },
    { tag: 'Competitive', count: 1 },
  ]);
  assert.deepEqual(getTagCounts([], 'mechanics'), []);
  assert.equal(JSON.stringify(pool), before);
});

test('count descending takes precedence and tied tags use Swedish alphabetical order', () => {
  const pool = [
    { ...games[0], id: 'a', mechanics: ['Ö', 'Å', 'Z', 'Ä', 'Common'] },
    { ...games[0], id: 'b', mechanics: ['Common'] },
  ];
  assert.deepEqual(getTagCounts(pool, 'mechanics'), [
    { tag: 'Common', count: 2 },
    { tag: 'Z', count: 1 },
    { tag: 'Å', count: 1 },
    { tag: 'Ä', count: 1 },
    { tag: 'Ö', count: 1 },
  ]);
});

test('full catalog tag counts stay independent of combined filters, favorites and sorting', () => {
  const counts = getTagCounts(games, 'gameTypes');
  const mechanicCounts = getTagCounts(games, 'mechanics');
  const result = filterGames(games, {
    gameType: 'Competitive',
    mechanic: 'Deckbuilding',
    players: '2',
    availability: 'owned',
    libraryView: 'favorites',
    favorites: ['starwars', 'clank'],
    sort: 'name',
  });
  assert.deepEqual(result.map((g) => g.id).sort(), ['clank', 'starwars']);
  assert.deepEqual(getTagCounts(games, 'gameTypes'), counts);
  assert.deepEqual(getTagCounts(games, 'mechanics'), mechanicCounts);
  for (const [field, options] of [
    ['gameTypes', counts],
    ['mechanics', mechanicCounts],
  ])
    for (const option of options) {
      const expected = new Set(
        games.filter((g) => g[field].includes(option.tag)).map((g) => g.id),
      ).size;
      assert.equal(option.count, expected, option.tag);
      assert(option.count > 0);
    }
  const party = counts.find((option) => option.tag === 'Party');
  assert(
    party.count >
      games.filter((g) => g.upcoming === false && g.gameTypes.includes('Party'))
        .length,
  );
});

test('type and mechanic colors follow tag identity through reordering, count changes and new tags', () => {
  const options = [
    ...getTagCounts(games, 'gameTypes'),
    ...getTagCounts(games, 'mechanics'),
  ];
  const original = new Map(options.map(({ tag }) => [tag, getTagColor(tag)]));
  for (const { tag } of [...options].reverse())
    assert.equal(getTagColor(tag), original.get(tag));
  const changed = getTagCounts(
    [
      ...games,
      { ...games[0], id: 'new-game', gameTypes: ['Solo', 'New type'] },
    ],
    'gameTypes',
  );
  for (const { tag } of changed)
    if (original.has(tag)) assert.equal(getTagColor(tag), original.get(tag));
  assert.equal(getTagColor('New type'), getTagColor('New type'));
  assert.match(getTagColor('New type'), /^hsl\(\d+ 24% 60%\)$/);
});
