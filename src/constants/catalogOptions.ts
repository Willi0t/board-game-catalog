import games from '../data/games';

import getTagCounts from '../utils/getTagCounts';

export const mechanicTags = getTagCounts(games, 'mechanics');
export const gameTypeTags = getTagCounts(games, 'gameTypes');
export const mechanicOptions = mechanicTags
  .map(({ tag }) => tag)
  .sort((a, b) => a.localeCompare(b, 'sv'));
export const gameTypeOptions = gameTypeTags
  .map(({ tag }) => tag)
  .sort((a, b) => a.localeCompare(b, 'sv'));
export const playerOptions = Array.from(
  { length: Math.max(...games.map((game) => game.playersMax ?? 0)) },
  (_, index) => index + 1,
);
