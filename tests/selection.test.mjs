import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transpileModule, ModuleKind } from 'typescript';
import games from '../src/games.json' with { type: 'json' };

async function loadUtility(path) {
  const code = transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ModuleKind.ESNext },
  }).outputText;
  return (
    await import(
      `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
    )
  ).default;
}
const resolveSelectedGame = await loadUtility(
  'src/utils/resolveSelectedGame.ts',
);
const filterGames = await loadUtility('src/utils/filterGames.ts');
const pool = [
  { ...games[0], id: 'b', title: 'Beta' },
  { ...games[0], id: 'a', title: 'Alfa' },
  { ...games[0], id: 'c', title: 'Charlie' },
];

test('initial and invalid selections use the first visible game in the current sort order', () => {
  assert.equal(resolveSelectedGame(pool, null), pool[0]);
  const sorted = filterGames(pool, { sort: 'name' });
  assert.equal(resolveSelectedGame(sorted, null), pool[1]);
  assert.equal(resolveSelectedGame(sorted, 'missing'), pool[1]);
  assert.equal(
    resolveSelectedGame(filterGames(pool, { query: 'charlie' }), 'a'),
    pool[2],
  );
});

test('manual selection survives filtering and sorting; zero results clear it before a new fallback', () => {
  const sorted = filterGames(pool, { sort: 'name' });
  assert.equal(resolveSelectedGame(sorted, 'b'), pool[0]);
  assert.equal(
    resolveSelectedGame(filterGames(pool, { query: 'beta' }), 'b'),
    pool[0],
  );
  const emptySelection = resolveSelectedGame(
    filterGames(pool, { query: 'no matches' }),
    'b',
  );
  assert.equal(emptySelection, undefined);
  assert.equal(resolveSelectedGame([], null), undefined);
  const selectedId = emptySelection?.id ?? null;
  assert.equal(resolveSelectedGame(sorted, selectedId), pool[1]);
});
