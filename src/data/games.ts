import gameData from '../games.json';
import type { Game, InteractionScore } from '../types/game';

function isInteractionScore(
  value: number | null,
): value is InteractionScore | null {
  return (
    value === null ||
    value === 0 ||
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5
  );
}

const games: Game[] = gameData.map((game) => {
  const playerInteraction = game.playerInteraction;
  if (!isInteractionScore(playerInteraction))
    throw new Error(`Invalid interaction score for ${game.id}`);
  const status = game.descriptionStatus;
  if (status !== 'draft' && status !== 'missing' && status !== 'complete') {
    throw new Error(`Invalid description status for ${game.id}`);
  }
  return { ...game, playerInteraction, descriptionStatus: status };
});

export default games;
