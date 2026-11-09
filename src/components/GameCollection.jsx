import React from 'react';
import Icon from './Icon';
import GameCard from './GameCard';

export default function GameCollection({
  games,
  selectedGame,
  favorites,
  sort,
  onSortChange,
  onSelectGame,
  onReset,
}) {
  return (
    <section className="collection" aria-label="Spelsamling">
      <div className="collection-heading">
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
        <div className="game-grid">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isSelected={selectedGame?.id === game.id}
              isFavorite={favorites.includes(game.id)}
              onSelectGame={onSelectGame}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Icon name="search" size={34} />
          <h2>Inga spel hittades</h2>
          <p>Prova en annan sökning eller ta bort dina filter.</p>
          <button onClick={onReset}>Visa alla spel</button>
        </div>
      )}
      <p className="collection-footnote">
        En första titt på samlingen · Bilder och spelvärden är platshållare.
      </p>
    </section>
  );
}
