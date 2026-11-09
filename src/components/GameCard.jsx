import React from 'react';
import Icon from './Icon';

export default function GameCard({
  game,
  isSelected,
  isFavorite,
  onSelectGame,
}) {
  return (
    <button
      className={`game-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelectGame(game)}
      aria-pressed={isSelected}
    >
      <div className="cover-wrap">
        <img
          src={game.cover}
          alt={`Platshållaromslag för ${game.title}`}
          loading="lazy"
        />
        {isFavorite && (
          <span className="card-heart">
            <Icon name="heart" size={14} />
          </span>
        )}
        <span className="selected-indicator">
          Valt spel <Icon name="arrow" size={14} />
        </span>
      </div>
      <h2>{game.title}</h2>
      <p>{game.edition || game.category}</p>
    </button>
  );
}
