import type { Game } from '../../types/game';
import styles from './GameStatus.module.css';

export default function GameStatus({ game }: { game: Game }) {
  if (game.upcoming === undefined) return null;
  return (
    <span
      className={`${styles.status} ${game.upcoming ? styles.upcoming : styles.owned}`}
    >
      {game.upcoming ? 'Kommande' : 'I samlingen'}
    </span>
  );
}
