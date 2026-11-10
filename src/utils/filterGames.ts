import type { Game } from '../types/game';

export type Availability = 'all' | 'owned' | 'upcoming';

export interface GameFilters {
  category?: string;
  favorites?: readonly string[];
  query?: string;
  players?: string;
  duration?: string;
  sort?: string;
  mechanic?: string;
  gameType?: string;
  availability?: Availability;
}

export default function filterGames(
  games: readonly Game[],
  {
    category = 'Alla spel',
    favorites = [],
    query = '',
    players = '',
    duration = '',
    sort = 'default',
    mechanic = '',
    gameType = '',
    availability = 'all',
  }: GameFilters = {},
) {
  const filtered = games.filter(
    (game) =>
      (category === 'Alla spel' ||
        (category === 'Favoriter'
          ? favorites.includes(game.id)
          : game.category === category)) &&
      `${game.title} ${game.edition} ${game.category} ${game.mechanics.join(' ')} ${game.gameTypes.join(' ')}`
        .toLocaleLowerCase('sv')
        .includes(query.toLocaleLowerCase('sv')) &&
      (!players ||
        (game.playersMin != null &&
          game.playersMax != null &&
          game.playersMin <= Number(players) &&
          game.playersMax >= Number(players))) &&
      (!duration ||
        (game.minutes != null && game.minutes <= Number(duration))) &&
      (!mechanic || game.mechanics.includes(mechanic)) &&
      (!gameType || game.gameTypes.includes(gameType)) &&
      (availability === 'all' ||
        (availability === 'owned'
          ? game.upcoming === false
          : game.upcoming === true)),
  );
  if (sort === 'name')
    filtered.sort((a, b) => a.title.localeCompare(b.title, 'sv'));
  if (sort === 'time')
    filtered.sort((a, b) => {
      if (a.minutes == null) return b.minutes == null ? 0 : 1;
      if (b.minutes == null) return -1;
      return a.minutes - b.minutes;
    });
  return filtered;
}
