import React from 'react';
import Icon from '../Icon/Icon';
import GameCard from '../GameCard/GameCard';

import type { Game } from '../../types/game';
import styles from './GameCollection.module.css';

interface GameCollectionProps {
  games: Game[];
  selectedGame: Game | undefined;
  favorites: string[];
  sort: string;
  onSortChange: (sort: string) => void;
  onSelectGame: (game: Game) => void;
  onOpenDetails: (game: Game, trigger: HTMLButtonElement) => void;
  onReset: () => void;
}
export default function GameCollection({
  games,
  selectedGame,
  favorites,
  sort,
  onSortChange,
  onSelectGame,
  onOpenDetails,
  onReset,
}: GameCollectionProps) {
  return (
    <section className={styles['collection']} aria-label="Spelsamling">
      <div className={styles['collection-heading']}>
        <p>
          <strong>{games.length}</strong> spel att upptäcka
        </p>
        <select
          value={sort}
          aria-label="Sortera spel"
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="default">Samlingens ordning</option>
          <option value="name">Namn A–Ö</option>
          <option value="time">Kortast speltid</option>
        </select>
      </div>
      {games.length ? (
        <div className={styles['game-grid']}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isSelected={selectedGame?.id === game.id}
              isFavorite={favorites.includes(game.id)}
              onSelectGame={onSelectGame}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        <div className={styles['empty']}>
          <Icon name="search" size={34} />
          <h2>Inga spel hittades</h2>
          <p>Prova en annan sökning eller ta bort dina filter.</p>
          <button onClick={onReset}>Visa alla spel</button>
        </div>
      )}
      <p className={styles['collection-footnote']}>
        En första titt på samlingen · Bilder och spelvärden är platshållare.
      </p>
    </section>
  );
}
