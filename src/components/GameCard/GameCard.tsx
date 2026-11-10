import GameStatus from '../GameStatus/GameStatus';
import Icon from '../Icon/Icon';
import GameImage from '../GameImage/GameImage';
import { getCoverImage } from '../../utils/gameImages';

import type { Game } from '../../types/game';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  isSelected: boolean;
  isFavorite: boolean;
  onSelectGame: (game: Game, trigger: HTMLButtonElement) => void;
  onOpenDetails: (game: Game, trigger: HTMLButtonElement) => void;
}
export default function GameCard({
  game,
  isSelected,
  isFavorite,
  onSelectGame,
  onOpenDetails,
}: GameCardProps) {
  return (
    <button
      className={`${styles['game-card']} ${isSelected ? styles.selected : ''}`}
      onClick={(event) => onSelectGame(game, event.currentTarget)}
      onDoubleClick={(event) => onOpenDetails(game, event.currentTarget)}
      aria-pressed={isSelected}
    >
      <div className={styles['cover-wrap']}>
        <GameImage
          image={getCoverImage(game)}
          className={styles.image}
          loading="lazy"
        />
        {game.upcoming === true && (
          <span className={styles.status}>
            <GameStatus game={game} />
          </span>
        )}
        {isFavorite && (
          <span className={styles['card-heart']}>
            <Icon name="heart" size={14} />
          </span>
        )}
        <span className={styles['selected-indicator']}>
          Valt spel <Icon name="arrow" size={14} />
        </span>
      </div>
      <h2>{game.title}</h2>
      <p>{game.edition || game.gameTypes[0] || game.category}</p>
    </button>
  );
}
