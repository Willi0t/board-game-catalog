import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transpileModule, ModuleKind } from 'typescript';
import games from '../src/games.json' with { type: 'json' };

const code = transpileModule(
  fs.readFileSync('src/utils/gamePicker.ts', 'utf8'),
  { compilerOptions: { module: ModuleKind.ESNext } },
).outputText;
const {
  countPickerOptions,
  findPickerConflicts,
  defaultPickerCriteria,
  matchPickerGames,
  suggestPickerChanges,
  weightLevel,
} = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
);
const game = (id, overrides = {}) => ({
  ...games[0],
  id,
  playersMin: 2,
  playersMax: 4,
  weight: 2,
  playerInteraction: 0,
  upcoming: false,
  gameTypes: ['Competitive'],
  mechanics: ['Drafting'],
  ...overrides,
});
const criteria = (overrides = {}) => ({
  ...defaultPickerCriteria(),
  players: 2,
  ...overrides,
});

test('positive whole player count is mandatory, inclusive bounds and unknown ranges', () => {
  const pool = [
    game('range'),
    game('unknown', { playersMin: null, playersMax: null }),
    game('partial', { playersMax: null }),
  ];
  for (const count of [2, 3, 4])
    assert.deepEqual(
      matchPickerGames(pool, criteria({ players: count })).map((g) => g.id),
      ['range'],
    );
  for (const count of [null, 0, -1, 1, 5, 2.5, NaN, Infinity])
    assert.equal(
      matchPickerGames(pool, criteria({ players: count })).length,
      0,
    );
});

test('difficulty bands use exact unrounded values, OR, inclusive 1/5 and exclusive 2/3 boundaries', () => {
  const values = [0.99, 1, 1.99, 1.9999, 2, 2.99, 2.9999, 3, 5, 5.01, null];
  const pool = values.map((weight, i) => game(String(i), { weight }));
  assert.deepEqual(values.map(weightLevel), [
    undefined,
    'low',
    'low',
    'low',
    'medium',
    'medium',
    'medium',
    'high',
    'high',
    undefined,
    undefined,
  ]);
  for (const [weightLevels, expected] of [
    [['low'], [1, 1.99, 1.9999]],
    [['medium'], [2, 2.99, 2.9999]],
    [['high'], [3, 5]],
    [
      ['medium', 'high'],
      [2, 2.99, 2.9999, 3, 5],
    ],
    [
      ['low', 'high'],
      [1, 1.99, 1.9999, 3, 5],
    ],
    [[], values],
  ])
    assert.deepEqual(
      matchPickerGames(pool, criteria({ weightLevels })).map((g) => g.weight),
      expected,
    );
});

test('OR within each tag group, AND across all groups, no mutation', () => {
  const pool = Object.freeze([
    game('a', { gameTypes: ['Cooperative'], mechanics: ['Deckbuilding'] }),
    game('b', { gameTypes: ['Competitive'], mechanics: ['Drafting'] }),
    game('wrong-mechanic', {
      gameTypes: ['Cooperative'],
      mechanics: ['Dice rolling'],
    }),
    game('wrong-type', { gameTypes: ['Solo'], mechanics: ['Drafting'] }),
  ]);
  const selected = criteria({
    gameTypes: ['Cooperative', 'Competitive'],
    mechanics: ['Deckbuilding', 'Drafting'],
    weightLevels: ['medium'],
    interactionLevels: ['low'],
  });
  const before = JSON.stringify([pool, selected]);
  assert.deepEqual(
    matchPickerGames(pool, selected).map((g) => g.id),
    ['a', 'b'],
  );
  assert.equal(matchPickerGames(pool, criteria()).length, 4);
  assert.equal(JSON.stringify([pool, selected]), before);
});

test('default is known owned only; includeUpcoming also admits unknown availability', () => {
  const pool = [
    game('owned'),
    game('upcoming', { upcoming: true }),
    game('unknown', { upcoming: undefined }),
  ];
  assert.deepEqual(
    matchPickerGames(pool, criteria()).map((g) => g.id),
    ['owned'],
  );
  assert.equal(
    matchPickerGames(pool, criteria({ includeUpcoming: true })).length,
    3,
  );
});

test('interaction bands include 0/5 and exclude missing scores only when active', () => {
  const pool = [0, 1, 2, 3, 4, 5, null].map((score, index) =>
    game(String(index), { playerInteraction: score }),
  );
  for (const [interactionLevels, expected] of [
    [['low'], [0, 1]],
    [['medium'], [2, 3]],
    [['high'], [4, 5]],
  ])
    assert.deepEqual(
      matchPickerGames(pool, criteria({ interactionLevels })).map(
        (g) => g.playerInteraction,
      ),
      expected,
    );
  assert.equal(matchPickerGames(pool, criteria()).length, 7);
});

test('empty-result suggestions are explicit changes with verifiably positive counts', () => {
  const selected = criteria({
    weightLevels: ['low'],
    gameTypes: ['Solo'],
    mechanics: ['Drafting'],
    interactionLevels: ['high'],
  });
  const pool = [
    game('relax-both', {
      weight: 3,
      gameTypes: ['Competitive'],
      mechanics: ['Dice rolling'],
      playerInteraction: 1,
    }),
  ];
  assert.equal(matchPickerGames(pool, selected).length, 0);
  const before = JSON.stringify(selected);
  const suggestions = suggestPickerChanges(pool, selected);
  assert(suggestions.length > 0);
  for (const suggestion of suggestions) {
    assert(suggestion.count > 0);
    assert.equal(
      matchPickerGames(pool, { ...selected, ...suggestion.changes }).length,
      suggestion.count,
    );
  }
  assert.equal(JSON.stringify(selected), before);
  const weightSuggestions = suggestPickerChanges(
    [game('weight', { weight: 3 })],
    criteria({ weightLevels: ['low'] }),
  );
  assert(
    weightSuggestions.some(
      (suggestion) =>
        suggestion.changes.weightLevels?.length === 0 && suggestion.count === 1,
    ),
  );
  const far = suggestPickerChanges(pool, criteria({ players: 10000 }));
  assert(far.some((suggestion) => suggestion.changes.players === 4));
});

test('actual catalog suggestions honor all declared criteria, default excludes 21 upcoming', () => {
  const fresh = defaultPickerCriteria();
  assert.equal(fresh.includeUpcoming, false);
  assert.deepEqual(fresh.gameTypes, []);
  assert.deepEqual(fresh.mechanics, []);
  for (const players of [1, 2, 3, 4, 6, 9, 100, 101])
    for (const weightLevels of [
      [],
      ['low'],
      ['medium'],
      ['high'],
      ['medium', 'high'],
    ])
      for (const interactionLevels of [
        [],
        ['low'],
        ['medium'],
        ['high'],
        ['medium', 'high'],
      ]) {
        const selected = criteria({ players, weightLevels, interactionLevels });
        const matched = matchPickerGames(games, selected);
        assert(
          matched.every(
            (g) =>
              g.upcoming === false &&
              g.playersMin <= players &&
              g.playersMax >= players,
          ),
        );
        if (!matched.length)
          for (const suggestion of suggestPickerChanges(games, selected))
            assert.equal(
              matchPickerGames(games, { ...selected, ...suggestion.changes })
                .length,
              suggestion.count,
            );
      }
});

test('Party is canonical, retained alongside other tags and filters in both the catalog and guide', () => {
  const ids = [
    'deep-regrets-deeper-regrets',
    'love-letter',
    'libertalia-winds-of-galecrest',
    'high-society',
    'vaalbara',
    'citadels',
    'cosmic',
    'magical-athleete',
    'goats-and-goblins',
    'decko-pistachio',
    'davos',
    'the-old-king-s-crown',
    'detectives-vs-criminals',
  ];
  for (const id of ids) {
    const entry = games.find((g) => g.id === id);
    assert(entry, id);
    assert.equal(entry.gameTypes.filter((t) => t === 'Party').length, 1, id);
    assert(
      !entry.gameTypes.includes('party') && !entry.gameTypes.includes('paty'),
    );
    assert.equal(
      matchPickerGames(
        [entry],
        criteria({
          players: entry.playersMin,
          gameTypes: ['Party'],
          includeUpcoming: true,
        }),
      ).includes(entry),
      entry.playersMin != null && entry.playersMax != null,
      id,
    );
  }
  assert(
    games.find((g) => g.id === 'magical-athleete').gameTypes.includes('Racing'),
  );
  assert(
    games
      .find((g) => g.id === 'detectives-vs-criminals')
      .gameTypes.includes('Team-based'),
  );
});

test('guide uses approved Terraforming Mars values, medium interaction and Hitman availability', () => {
  const mars = games.find((game) => game.id === 'terraforming');
  const hitman = games.find((game) => game.id === 'hitman-the-board-game');
  assert(
    matchPickerGames(
      games,
      criteria({ players: 3, interactionLevels: ['medium'] }),
    ).includes(mars),
  );
  assert(
    !matchPickerGames(
      games,
      criteria({ players: 3, interactionLevels: ['low'] }),
    ).includes(mars),
  );
  assert(
    matchPickerGames(
      games,
      criteria({ players: 3, weightLevels: ['high'] }),
    ).includes(mars),
  );
  assert(
    !matchPickerGames(
      games,
      criteria({ players: 3, interactionLevels: ['high'] }),
    ).includes(mars),
  );
  assert(
    !matchPickerGames(games, criteria({ players: hitman.playersMin })).includes(
      hitman,
    ),
  );
  const knownRange = { ...hitman, playersMin: 1, playersMax: 5 };
  assert(!matchPickerGames([knownRange], criteria()).length);
  assert.deepEqual(
    matchPickerGames([knownRange], criteria({ includeUpcoming: true })),
    [knownRange],
  );
  if (hitman.playersMin == null || hitman.playersMax == null)
    assert(
      !matchPickerGames([hitman], criteria({ includeUpcoming: true })).length,
    );
});

const optionPool = [
  game('a', {
    playersMin: 1,
    playersMax: 3,
    weight: 1.999,
    playerInteraction: 0,
    gameTypes: ['Competitive', 'Cooperative'],
    mechanics: ['Deckbuilding', 'Drafting'],
  }),
  game('b', {
    playersMin: 2,
    playersMax: 4,
    weight: 2,
    playerInteraction: 2,
    gameTypes: ['Cooperative'],
  }),
  game('c', {
    playersMin: 3,
    playersMax: 5,
    weight: 3,
    playerInteraction: 5,
    gameTypes: ['Party'],
    mechanics: ['Dice rolling'],
  }),
  game('unknown-facts', {
    playersMin: 1,
    playersMax: 3,
    weight: null,
    playerInteraction: null,
    gameTypes: ['Party'],
  }),
  game('upcoming', {
    upcoming: true,
    weight: 4,
    playerInteraction: 0,
    gameTypes: ['Cooperative'],
    mechanics: ['Deckbuilding'],
  }),
  game('unknown-availability', {
    upcoming: undefined,
    weight: 2,
    playerInteraction: 3,
    gameTypes: ['Team-based'],
  }),
  game('unknown-players', {
    playersMin: null,
    playersMax: null,
    weight: 2,
    gameTypes: ['Cooperative'],
  }),
];

test('ordered option counts include every integer in a player interval and only earlier groups', () => {
  const selected = criteria({
    weightLevels: ['low'],
    gameTypes: ['Cooperative'],
    interactionLevels: ['low'],
    mechanics: ['Deckbuilding', 'Drafting'],
  });
  const counts = countPickerOptions(optionPool, selected);
  assert.deepEqual(counts.players, { 1: 2, 2: 3, 3: 4, 4: 2, 5: 1, 6: 0 });
  assert.deepEqual(counts.weightLevels, { any: 3, low: 1, medium: 1, high: 0 });
  assert.deepEqual(counts.gameTypes, {
    Competitive: 1,
    Cooperative: 1,
    Party: 0,
    'Team-based': 0,
  });
  assert.deepEqual(counts.interaction, { any: 1, low: 1, medium: 0, high: 0 });
  assert.deepEqual(counts.mechanics, {
    Deckbuilding: 1,
    Drafting: 1,
    'Dice rolling': 0,
  });
  assert.equal(counts.total, 1); // One multi-tagged game, not the sum of its two mechanic counts.
  const later = countPickerOptions(optionPool, {
    ...selected,
    interactionLevels: ['high'],
    mechanics: ['Dice rolling'],
  });
  assert.deepEqual(later.players, counts.players);
  assert.deepEqual(later.weightLevels, counts.weightLevels);
  assert.deepEqual(later.gameTypes, counts.gameTypes);
  assert.deepEqual(later.interaction, counts.interaction);
  assert.equal(later.mechanics.Deckbuilding, 0);
  assert.equal(later.total, 0);
});

test('each option ignores its own OR group while earlier OR groups combine with AND', () => {
  const a = countPickerOptions(
    optionPool,
    criteria({ players: 3, weightLevels: ['low'], gameTypes: ['Competitive'] }),
  );
  const b = countPickerOptions(
    optionPool,
    criteria({
      players: 3,
      weightLevels: ['low', 'medium'],
      gameTypes: ['Competitive', 'Cooperative'],
    }),
  );
  assert.deepEqual(a.weightLevels, b.weightLevels);
  assert.equal(a.gameTypes.Cooperative, 1);
  assert.equal(b.gameTypes.Cooperative, 2);
  assert.equal(b.interaction.low, 1);
  assert.equal(b.interaction.medium, 1);
  assert.equal(b.total, 2);
  const ownType = countPickerOptions(
    optionPool,
    criteria({
      players: 3,
      weightLevels: ['low', 'medium'],
      gameTypes: ['Party'],
    }),
  );
  assert.deepEqual(ownType.gameTypes, b.gameTypes);
  const ownMechanics = countPickerOptions(
    optionPool,
    criteria({
      players: 3,
      weightLevels: ['low', 'medium'],
      gameTypes: ['Competitive', 'Cooperative'],
      mechanics: ['Drafting', 'Deckbuilding'],
    }),
  );
  assert.deepEqual(ownMechanics.mechanics, b.mechanics);
  assert.equal(ownMechanics.total, 2);
});

test('availability changes all option prefixes; unknown facts stay out of specific bands and zero interaction counts', () => {
  const owned = countPickerOptions(optionPool, criteria());
  const all = countPickerOptions(
    optionPool,
    criteria({ includeUpcoming: true }),
  );
  assert.equal(owned.players[2], 3);
  assert.equal(all.players[2], 5);
  assert.deepEqual(all.weightLevels, { any: 5, low: 1, medium: 2, high: 1 });
  assert.deepEqual(all.interaction, { any: 5, low: 2, medium: 2, high: 0 });
  assert.equal(all.gameTypes.Cooperative, 3);
  assert.equal(all.mechanics.Deckbuilding, 2);
  assert.equal(all.total, 5);
  assert.equal(
    countPickerOptions(optionPool, defaultPickerCriteria()).total,
    0,
  );
});

test('conflicting selected options are reported by step without clearing or mutating later choices', () => {
  const selected = criteria({
    players: 1,
    weightLevels: ['medium'],
    gameTypes: ['Cooperative'],
    interactionLevels: ['high'],
    mechanics: ['Deckbuilding'],
  });
  const before = JSON.stringify([selected, optionPool]);
  const counts = countPickerOptions(optionPool, selected);
  const conflicts = findPickerConflicts(selected, counts);
  assert.equal(counts.weightLevels.medium, 0);
  assert.equal(counts.total, 0);
  assert.deepEqual(
    conflicts.map((c) => c.step),
    [0, 1, 1, 2],
  );
  assert(conflicts.some((c) => c.label.includes('Medel')));
  assert(conflicts.some((c) => c.label.includes('Deckbuilding')));
  assert.equal(JSON.stringify([selected, optionPool]), before);
  const valid = countPickerOptions(
    optionPool,
    criteria({ weightLevels: ['low'] }),
  );
  assert.deepEqual(
    findPickerConflicts(criteria({ weightLevels: ['low'] }), valid),
    [],
  );
  const partial = criteria({ weightLevels: ['low', 'high'] });
  assert.equal(countPickerOptions(optionPool, partial).total, 1);
  assert.equal(
    findPickerConflicts(partial, countPickerOptions(optionPool, partial))
      .length,
    1,
  );
});

test('counts and results use unique game identities, including overlapping tags and duplicate inputs', () => {
  const entry = optionPool[0];
  const pool = [entry, { ...entry }, { ...entry }];
  const selected = criteria({
    mechanics: ['Deckbuilding', 'Drafting'],
    gameTypes: ['Competitive', 'Cooperative'],
  });
  const counts = countPickerOptions(pool, selected);
  assert.equal(counts.players[2], 1);
  assert.equal(counts.gameTypes.Competitive, 1);
  assert.equal(counts.gameTypes.Cooperative, 1);
  assert.equal(counts.mechanics.Deckbuilding, 1);
  assert.equal(counts.mechanics.Drafting, 1);
  assert.equal(counts.total, 1);
  assert.deepEqual(matchPickerGames(pool, selected), [entry]);
});

test('real catalog option totals equal unique final results across prefixes and availability', () => {
  for (const players of [1, 2, 3, 6, 100, 101])
    for (const includeUpcoming of [false, true])
      for (const weightLevels of [[], ['low'], ['medium', 'high']]) {
        const selected = criteria({
          players,
          includeUpcoming,
          weightLevels,
          gameTypes: ['Cooperative', 'Party'],
          interactionLevels: ['low'],
          mechanics: ['Drafting', 'Deckbuilding'],
        });
        const counts = countPickerOptions(games, selected);
        const matched = matchPickerGames(games, selected);
        assert.equal(
          counts.total,
          new Set(matched.map((game) => game.id)).size,
        );
        const prior = games.filter(
          (game) =>
            (includeUpcoming || game.upcoming === false) &&
            game.playersMin != null &&
            game.playersMax != null &&
            game.playersMin <= players &&
            game.playersMax >= players,
        );
        assert.equal(counts.weightLevels.any, prior.length);
        assert.equal(
          counts.weightLevels.low,
          prior.filter(
            (game) =>
              game.weight != null && game.weight >= 1 && game.weight < 2,
          ).length,
        );
        assert.equal(
          counts.weightLevels.medium,
          prior.filter(
            (game) =>
              game.weight != null && game.weight >= 2 && game.weight < 3,
          ).length,
        );
        assert.equal(
          counts.weightLevels.high,
          prior.filter(
            (game) =>
              game.weight != null && game.weight >= 3 && game.weight <= 5,
          ).length,
        );
      }
});

test('interaction multiselect is OR, clearing levels restores unknown scores and 0/5 stays valid', () => {
  const pool = [0, 1, 2, 3, 4, 5, null].map((playerInteraction, index) =>
    game(String(index), { playerInteraction }),
  );
  for (const [interactionLevels, expected] of [
    [
      ['medium', 'high'],
      [2, 3, 4, 5],
    ],
    [['high'], [4, 5]],
    [[], [0, 1, 2, 3, 4, 5, null]],
    [['low'], [0, 1]],
  ])
    assert.deepEqual(
      matchPickerGames(pool, criteria({ interactionLevels })).map(
        (game) => game.playerInteraction,
      ),
      expected,
    );
});

test('interaction levels do not restrict one another, while mechanic counts and totals use their union', () => {
  const pool = [
    game('medium-a', { playerInteraction: 2, mechanics: ['Deckbuilding'] }),
    game('medium-b', { playerInteraction: 3, mechanics: ['Drafting'] }),
    game('high-a', { playerInteraction: 4, mechanics: ['Dice rolling'] }),
    game('high-b', { playerInteraction: 5, mechanics: ['Deckbuilding'] }),
    game('low', { playerInteraction: 0 }),
    game('unknown', { playerInteraction: null }),
    game('wrong-type', { playerInteraction: 5, gameTypes: ['Solo'] }),
    game('wrong-weight', { playerInteraction: 5, weight: 1 }),
    game('upcoming', { playerInteraction: 4, upcoming: true }),
  ];
  const selected = criteria({
    weightLevels: ['medium'],
    gameTypes: ['Competitive'],
    interactionLevels: ['medium', 'high'],
    mechanics: ['Deckbuilding', 'Dice rolling'],
  });
  const counts = countPickerOptions(pool, selected);
  assert.deepEqual(counts.interaction, { any: 6, low: 1, medium: 2, high: 2 });
  assert.deepEqual(counts.mechanics, {
    Deckbuilding: 2,
    Drafting: 1,
    'Dice rolling': 1,
  });
  assert.equal(counts.total, 3);
  assert.deepEqual(
    matchPickerGames(pool, selected).map((game) => game.id),
    ['medium-a', 'high-a', 'high-b'],
  );
  const highOnly = countPickerOptions(pool, {
    ...selected,
    interactionLevels: ['high'],
  });
  assert.deepEqual(highOnly.interaction, counts.interaction);
  assert.deepEqual(highOnly.mechanics, {
    Deckbuilding: 1,
    Drafting: 0,
    'Dice rolling': 1,
  });
  const noFilter = countPickerOptions(pool, {
    ...selected,
    interactionLevels: [],
  });
  assert.deepEqual(noFilter.interaction, counts.interaction);
  assert.equal(noFilter.mechanics.Drafting, 3);
  assert.equal(counts.total, matchPickerGames(pool, selected).length);
});

test('multiple interaction choices becoming zero are retained and reported independently', () => {
  const selected = criteria({
    players: 1,
    interactionLevels: ['medium', 'high'],
  });
  const before = JSON.stringify(selected);
  const counts = countPickerOptions(
    [game('low-only', { playersMin: 1, playerInteraction: 0 })],
    selected,
  );
  assert.deepEqual(counts.interaction, { any: 1, low: 1, medium: 0, high: 0 });
  assert.equal(counts.total, 0);
  const conflicts = findPickerConflicts(selected, counts);
  assert.deepEqual(
    conflicts.map((conflict) => conflict.step),
    [1, 1],
  );
  assert(conflicts[0].label.includes('Medel'));
  assert(conflicts[1].label.includes('Hög'));
  assert.equal(JSON.stringify(selected), before);
  assert.equal(
    matchPickerGames(
      [game('low-only', { playersMin: 1, playerInteraction: 0 })],
      { ...selected, interactionLevels: [] },
    ).length,
    1,
  );
});

test('Social participates in guide choices, prefix counts and combined results', () => {
  const selected = criteria({ players: 3, gameTypes: ['Social'] });
  const social = matchPickerGames(games, selected);
  assert(social.length > 0);
  assert(
    social.every(
      (game) => game.gameTypes.includes('Social') && game.upcoming === false,
    ),
  );
  const counts = countPickerOptions(games, selected);
  assert.equal(counts.gameTypes.Social, social.length);
  assert.equal(counts.total, social.length);
  assert.equal(
    matchPickerGames(games, { ...selected, includeUpcoming: true }).length >=
      social.length,
    true,
  );
});
