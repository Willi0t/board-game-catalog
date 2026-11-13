import type { Game } from '../../types/game';
import GameExpansions from '../GameExpansions/GameExpansions';
import styles from './GameEditionDetails.module.css';

export default function GameEditionDetails({
  game,
  expansionsClassName,
  panel = false,
}: {
  game: Game;
  expansionsClassName?: string;
  panel?: boolean;
}) {
  return (
    <>
      {game.edition && (
        <section className={styles.section}>
          <h3>Min utgåva</h3>
          <p>{game.edition}</p>
        </section>
      )}
      <GameExpansions
        panel={panel}
        expansions={game.expansions}
        className={expansionsClassName}
      />
    </>
  );
}
