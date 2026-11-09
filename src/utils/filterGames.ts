import type { Game } from '../types/game';

interface GameFilters {
  category?: string;
  favorites?: readonly string[];
  query?: string;
  players?: string;
  duration?: string;
  sort?: string;
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
  }: GameFilters = {},
) {
  const filtered = games.filter(
    (g) =>
      (category === 'Alla spel' ||
        (category === 'Favoriter'
          ? favorites.includes(g.id)
          : g.category === category)) &&
      `${g.title} ${g.edition} ${g.category}`
        .toLocaleLowerCase('sv')
        .includes(query.toLocaleLowerCase('sv')) &&
      (!players ||
        (g.playersMin <= Number(players) && g.playersMax >= Number(players))) &&
      (!duration || g.minutes <= Number(duration)),
  );
  if (sort === 'name')
    filtered.sort((a, b) => a.title.localeCompare(b.title, 'sv'));
  if (sort === 'time') filtered.sort((a, b) => a.minutes - b.minutes);
  return filtered;
}
