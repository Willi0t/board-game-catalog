import type { Game } from '../types/game';

// Call with the visible grid after filtering and sorting.
export default function resolveSelectedGame(
  visibleGames: readonly Game[],
  selectedGameId: string | null,
): Game | undefined {
  return (
    visibleGames.find((game) => game.id === selectedGameId) ?? visibleGames[0]
  );
}
