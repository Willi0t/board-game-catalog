import React from 'react';
import Icon from '../Icon/Icon';

import type { Game } from '../../types/game';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  isSelected: boolean;
  isFavorite: boolean;
  onSelectGame: (game: Game) => void;
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
      onClick={() => onSelectGame(game)}
      onDoubleClick={(event) => onOpenDetails(game, event.currentTarget)}
      aria-pressed={isSelected}
    >
      <div className={styles['cover-wrap']}>
        <img
          src={game.cover}
          alt={`Platshållaromslag för ${game.title}`}
          loading="lazy"
        />
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
      <p>{game.edition || game.category}</p>
    </button>
  );
}
