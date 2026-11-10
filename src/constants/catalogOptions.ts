import games from '../data/games';

export const mechanicOptions = [
  ...new Set(games.flatMap((game) => game.mechanics)),
].sort((a, b) => a.localeCompare(b, 'sv'));
export const gameTypeOptions = [
  ...new Set(games.flatMap((game) => game.gameTypes)),
].sort((a, b) => a.localeCompare(b, 'sv'));
export const playerOptions = Array.from(
  { length: Math.max(...games.map((game) => game.playersMax ?? 0)) },
  (_, index) => index + 1,
);
