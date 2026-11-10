import type { Game } from '../types/game';

export type InteractionLevel = 'low' | 'medium' | 'high';
export type WeightLevel = 'low' | 'medium' | 'high';

export const weightLabels: Record<WeightLevel, string> = {
  low: 'Låg (1 ≤ vikt < 2)',
  medium: 'Medel (2 ≤ vikt < 3)',
  high: 'Hög (3 ≤ vikt ≤ 5)',
};

export function weightLevel(weight: number | null): WeightLevel | undefined {
  if (weight == null) return undefined;
  if (weight >= 1 && weight < 2) return 'low';
  if (weight >= 2 && weight < 3) return 'medium';
  if (weight >= 3 && weight <= 5) return 'high';
  return undefined;
}

export function interactionLevel(
  score: Game['playerInteraction'],
): InteractionLevel | undefined {
  if (score == null) return undefined;
  if (score >= 0 && score <= 1) return 'low';
  if (score >= 2 && score <= 3) return 'medium';
  if (score >= 4 && score <= 5) return 'high';
  return undefined;
}

export interface PickerCriteria {
  players: number | null;
  weightLevels: WeightLevel[];
  includeUpcoming: boolean;
  gameTypes: string[];
  interactionLevels: InteractionLevel[];
  mechanics: string[];
}

export const interactionLabels: Record<InteractionLevel, string> = {
  low: 'Låg (0–1/5)',
  medium: 'Medel (2–3/5)',
  high: 'Hög (4–5/5)',
};

export function defaultPickerCriteria(): PickerCriteria {
  return {
    players: null,
    weightLevels: [],
    includeUpcoming: false,
    gameTypes: [],
    interactionLevels: [],
    mechanics: [],
  };
}

export function matchPickerGames(
  games: readonly Game[],
  criteria: PickerCriteria,
): Game[] {
  const {
    players,
    weightLevels,
    includeUpcoming,
    gameTypes,
    interactionLevels,
    mechanics,
  } = criteria;
  if (players == null || !Number.isSafeInteger(players) || players <= 0)
    return [];
  const seen = new Set<string>();
  return games.filter((game) => {
    if (
      game.playersMin == null ||
      game.playersMax == null ||
      players < game.playersMin ||
      players > game.playersMax
    )
      return false;
    if (!includeUpcoming && game.upcoming !== false) return false;
    if (weightLevels.length) {
      const level = weightLevel(game.weight);
      if (level == null || !weightLevels.includes(level)) return false;
    }
    if (
      gameTypes.length &&
      !gameTypes.some((tag) => game.gameTypes.includes(tag))
    )
      return false;
    if (
      mechanics.length &&
      !mechanics.some((tag) => game.mechanics.includes(tag))
    )
      return false;
    if (interactionLevels.length) {
      const level = interactionLevel(game.playerInteraction);
      if (level == null || !interactionLevels.includes(level)) return false;
    }
    if (seen.has(game.id)) return false;
    seen.add(game.id);
    return true;
  });
}

export interface PickerSuggestion {
  label: string;
  changes: Partial<PickerCriteria>;
  count: number;
}

export function suggestPickerChanges(
  games: readonly Game[],
  criteria: PickerCriteria,
): PickerSuggestion[] {
  const suggestions: PickerSuggestion[] = [];
  const add = (label: string, changes: Partial<PickerCriteria>) => {
    const count = matchPickerGames(games, { ...criteria, ...changes }).length;
    if (count) suggestions.push({ label, changes, count });
    return count;
  };
  if (criteria.weightLevels.length)
    add('Ta bort svårighetsfiltret', { weightLevels: [] });
  if (criteria.mechanics.length)
    add('Ta bort mekanikfiltret', { mechanics: [] });
  if (criteria.gameTypes.length)
    add('Ta bort filtret för speltyp', { gameTypes: [] });
  if (criteria.interactionLevels.length)
    add('Låt interaktionen spela ingen roll', { interactionLevels: [] });
  if (!criteria.includeUpcoming)
    add('Inkludera kommande spel och okänd tillgänglighet', {
      includeUpcoming: true,
    });
  if (!suggestions.length) {
    const relaxed = { ...defaultPickerCriteria(), players: criteria.players };
    if (
      !add(
        `Behåll endast ${criteria.players} spelare och återställ övriga val`,
        relaxed,
      )
    ) {
      add(
        `Behåll ${criteria.players} spelare, återställ önskemålen och inkludera kommande/okänd tillgänglighet`,
        { ...relaxed, includeUpcoming: true },
      );
    }
  }
  const counts = new Set<number>();
  for (const game of games) {
    if (game.playersMin != null && game.playersMax != null) {
      for (
        let players = game.playersMin;
        players <= game.playersMax;
        players += 1
      )
        counts.add(players);
    }
  }
  const ordered = [...counts]
    .filter((players) => players !== criteria.players)
    .sort(
      (a, b) =>
        Math.abs(a - (criteria.players ?? 1)) -
          Math.abs(b - (criteria.players ?? 1)) || a - b,
    );
  const nearest = ordered.find(
    (players) => matchPickerGames(games, { ...criteria, players }).length > 0,
  );
  if (nearest != null)
    add(`Ändra till ${nearest} spelare`, { players: nearest });
  else if (!suggestions.length && ordered[0] != null)
    add(`Ändra till ${ordered[0]} spelare och återställ alla övriga val`, {
      ...defaultPickerCriteria(),
      players: ordered[0],
      includeUpcoming: true,
    });
  return suggestions;
}

export const weightOptions: readonly WeightLevel[] = ['low', 'medium', 'high'];
export const interactionOptions: readonly InteractionLevel[] = [
  'low',
  'medium',
  'high',
];
export const pickerPlayerOptions = [1, 2, 3, 4, 5, 6];

export interface PickerOptionCounts {
  players: Record<number, number>;
  weightLevels: Record<WeightLevel | 'any', number>;
  gameTypes: Record<string, number>;
  interaction: Record<InteractionLevel | 'any', number>;
  mechanics: Record<string, number>;
  total: number;
}

export function countPickerOptions(
  games: readonly Game[],
  criteria: PickerCriteria,
): PickerOptionCounts {
  const base = {
    ...defaultPickerCriteria(),
    includeUpcoming: criteria.includeUpcoming,
  };
  const count = (filters: PickerCriteria) =>
    matchPickerGames(games, filters).length;
  const players = Object.fromEntries(
    [
      ...new Set([
        ...pickerPlayerOptions,
        ...(criteria.players == null ? [] : [criteria.players]),
      ]),
    ].map((players) => [players, count({ ...base, players })]),
  );
  // Each prefix includes only earlier groups. An option replaces its entire group,
  // so other selected options in that same OR group cannot restrict its count.
  const beforeWeight = { ...base, players: criteria.players };
  const beforeType = { ...beforeWeight, weightLevels: criteria.weightLevels };
  const beforeInteraction = { ...beforeType, gameTypes: criteria.gameTypes };
  const beforeMechanic = {
    ...beforeInteraction,
    interactionLevels: criteria.interactionLevels,
  };
  const countWeight = (level: WeightLevel) =>
    count({ ...beforeWeight, weightLevels: [level] });
  const countInteraction = (level: InteractionLevel) =>
    count({ ...beforeInteraction, interactionLevels: [level] });
  const tags = (field: 'gameTypes' | 'mechanics', prefix: PickerCriteria) =>
    Object.fromEntries(
      [
        ...new Set([
          ...games.flatMap((game) => game[field]),
          ...criteria[field],
        ]),
      ].map((tag) => [tag, count({ ...prefix, [field]: [tag] })]),
    );
  return {
    players,
    weightLevels: {
      any: count(beforeWeight),
      low: countWeight('low'),
      medium: countWeight('medium'),
      high: countWeight('high'),
    },
    gameTypes: tags('gameTypes', beforeType),
    interaction: {
      any: count(beforeInteraction),
      low: countInteraction('low'),
      medium: countInteraction('medium'),
      high: countInteraction('high'),
    },
    mechanics: tags('mechanics', beforeMechanic),
    total: count(criteria),
  };
}

export interface PickerConflict {
  label: string;
  step: 0 | 1 | 2;
}

export function findPickerConflicts(
  criteria: PickerCriteria,
  counts: PickerOptionCounts,
): PickerConflict[] {
  if (criteria.players == null) return [];
  const conflicts: PickerConflict[] = [];
  if (counts.players[criteria.players] === 0)
    conflicts.push({ label: `${criteria.players} spelare`, step: 0 });
  for (const level of criteria.weightLevels)
    if (counts.weightLevels[level] === 0)
      conflicts.push({ label: `Svårighet: ${weightLabels[level]}`, step: 0 });
  for (const tag of criteria.gameTypes)
    if (counts.gameTypes[tag] === 0)
      conflicts.push({ label: `Speltyp: ${tag}`, step: 1 });
  for (const level of criteria.interactionLevels)
    if (counts.interaction[level] === 0)
      conflicts.push({
        label: `Interaktion: ${interactionLabels[level]}`,
        step: 1,
      });
  for (const tag of criteria.mechanics)
    if (counts.mechanics[tag] === 0)
      conflicts.push({ label: `Spelmekanik: ${tag}`, step: 2 });
  return conflicts;
}

export function togglePickerChoice<Choice extends string>(
  selected: readonly Choice[],
  choice: Choice,
): Choice[] {
  return selected.includes(choice)
    ? selected.filter((value) => value !== choice)
    : [...selected, choice];
}
