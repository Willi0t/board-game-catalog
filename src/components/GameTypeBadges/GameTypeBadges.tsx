import type { Game } from '../../types/game';
import styles from './GameTypeBadges.module.css';

export default function GameTypeBadges({
  gameTypes,
  appearance = 'default',
}: Pick<Game, 'gameTypes'> & { appearance?: 'default' | 'banner' }) {
  if (!gameTypes.length) return null;
  return (
    <ul
      className={`${styles.badges} ${appearance === 'banner' ? styles.banner : ''}`}
      aria-label="Speltyper"
    >
      {gameTypes.map((gameType) => (
        <li key={gameType}>{gameType}</li>
      ))}
    </ul>
  );
}
