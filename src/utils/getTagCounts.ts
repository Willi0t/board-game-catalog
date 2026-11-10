import type { Game } from '../types/game';

export interface CatalogTagCount {
  tag: string;
  count: number;
}

export default function getTagCounts(
  games: readonly Game[],
  field: 'gameTypes' | 'mechanics',
): CatalogTagCount[] {
  const idsByTag = new Map<string, Set<string>>();
  for (const game of games) {
    for (const tag of game[field]) {
      if (!tag.trim()) continue;
      const ids = idsByTag.get(tag) ?? new Set<string>();
      ids.add(game.id);
      idsByTag.set(tag, ids);
    }
  }
  return [...idsByTag]
    .map(([tag, ids]) => ({ tag, count: ids.size }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'sv'));
}
