import { useState } from 'react';
import type { Game } from '../types/game';
import filterGames, { type GameFilters } from '../utils/filterGames';
import { matchPickerGames, type PickerCriteria } from '../utils/gamePicker';
import resolveSelectedGame from '../utils/resolveSelectedGame';

type CatalogFilters = Required<Omit<GameFilters, 'favorites' | 'sort'>>;

const initialFilters: CatalogFilters = {
  category: 'Alla spel',
  query: '',
  players: '',
  duration: '',
  mechanic: '',
  gameType: '',
  availability: 'all',
};

export default function useCatalog(
  games: readonly Game[],
  favorites: readonly string[],
  pickerCriteria: PickerCriteria | null,
) {
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState('default');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const visibleGames = pickerCriteria
    ? filterGames(matchPickerGames(games, pickerCriteria), { sort })
    : filterGames(games, { ...filters, favorites, sort });
  const selectedGame = resolveSelectedGame(visibleGames, selectedGameId);
  const resolvedGameId = selectedGame?.id ?? null;
  // Persist the automatic fallback without invoking any manual-selection behavior.
  if (selectedGameId !== resolvedGameId) setSelectedGameId(resolvedGameId);

  const updateFilter = <Key extends keyof CatalogFilters>(
    key: Key,
    value: CatalogFilters[Key],
  ) => setFilters((previous) => ({ ...previous, [key]: value }));

  return {
    filters,
    updateFilter,
    resetFilters: () => setFilters(initialFilters),
    sort,
    setSort,
    visibleGames,
    selectedGame,
    selectGame: (game: Game) => setSelectedGameId(game.id),
  };
}
