import type { Game } from '../../types/game';
import styles from './GameTypeBadges.module.css';

export default function GameTypeBadges({ gameTypes }: Pick<Game, 'gameTypes'>) {
  if (!gameTypes.length) return null;
  return (
    <ul className={styles.badges} aria-label="Speltyper">
      {gameTypes.map((gameType) => (
        <li key={gameType}>{gameType}</li>
      ))}
    </ul>
  );
}
