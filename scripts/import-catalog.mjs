import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import matches from './catalog-matches.json' with { type: 'json' };

const importedFields = [
  'playersMin',
  'playersMax',
  'bestWith',
  'weight',
  'playerInteraction',
  'mechanics',
  'gameTypes',
  'upcoming',
];

export function mergeCatalog(existing, source) {
  if (source.games.length !== matches.length)
    throw new Error('Importen och matchningslistan har olika antal poster.');
  const ids = new Set();
  const sourceRows = new Set();
  const originalById = new Map(existing.map((game) => [game.id, game]));
  const imported = source.games.map((row) => {
    const match = matches.find(
      (match) =>
        match.sourceRow === row.sourceRow && match.sourceTitle === row.title,
    );
    if (!match || ids.has(match.id) || sourceRows.has(row.sourceRow))
      throw new Error(`Ogiltig eller dubbel matchning: ${row.title}`);
    ids.add(match.id);
    sourceRows.add(row.sourceRow);
    const original = originalById.get(match.id);
    const game = original
      ? { ...original }
      : {
          id: match.id,
          title: match.displayTitle ?? row.title,
          edition: '',
          category: 'Övrigt',
          accent: '#815467',
          tint: '#eadce2',
          description: '',
          placeholderTheme: 'castle-rose',
        };
    if (match.displayTitle) game.title = match.displayTitle;
    for (const field of importedFields) game[field] = row[field];
    // All legacy times were explicitly demo content. Never promote them to facts.
    if (!original || original.metadataStatus === 'placeholder')
      game.minutes = null;
    game.descriptionStatus =
      original?.descriptionStatus ??
      (original?.description ? 'draft' : 'missing');
    game.metadataStatus = 'catalog-import';
    if (match.expansions)
      game.expansions = [
        ...new Set([...(game.expansions ?? []), ...match.expansions]),
      ];
    game.catalogMetadata = {
      sourceRow: row.sourceRow,
      sourceTitle: row.title,
      importedAt: source.source.exportedAt,
      preliminary: row.upcoming || row.title === 'Parlay',
      editionMatch:
        row.title === 'Parlay' ? 'provisional' : 'not-independently-verified',
    };
    return game;
  });
  const byId = new Map(imported.map((game) => [game.id, game]));
  // Preserve collection order and local content for entries outside the export.
  const result = existing.map((game) => {
    if (byId.has(game.id)) return byId.get(game.id);
    if (game.metadataStatus !== 'placeholder') return { ...game };
    return {
      ...game,
      playersMin: null,
      playersMax: null,
      weight: null,
      minutes: null,
      bestWith: null,
      playerInteraction: null,
      mechanics: [],
      gameTypes: [],
      descriptionStatus: 'draft',
    };
  });
  for (const game of imported)
    if (!originalById.has(game.id)) result.push(game);
  if (new Set(result.map((game) => game.id)).size !== result.length)
    throw new Error('Dubbla katalog-id:n.');
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = JSON.parse(fs.readFileSync('catalog-data.json', 'utf8'));
  const existing = JSON.parse(fs.readFileSync('src/games.json', 'utf8'));
  const games = mergeCatalog(existing, source);
  fs.writeFileSync('src/games.json', JSON.stringify(games, null, 2) + '\n');
  fs.writeFileSync(
    'src/catalogMetadata.json',
    JSON.stringify(
      { source: source.source, dataQuality: source.dataQuality },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `${source.games.length} importerade poster; ${source.games.filter((game) => game.upcoming).length} kommande; ${games.length} katalogposter totalt.`,
  );
}
