export default function filterGames(
  games,
  {
    category = 'Alla spel',
    favorites = [],
    query = '',
    players = '',
    duration = '',
    sort = 'default',
  } = {},
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
