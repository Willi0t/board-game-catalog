import React from 'react';
import Icon from './Icon';
import GameGallery from './GameGallery';

export default function GameDetails({
  game,
  isFavorite,
  onToggleFavorite,
  tab,
  onTabChange,
  onOpenImage,
  detailsRef,
  collectionIndex,
}) {
  return (
    <aside
      ref={detailsRef}
      className="details"
      aria-label="Information om valt spel"
      key={game.id}
    >
      <div className="detail-hero">
        <img
          src={game.gallery[0]}
          alt={`Illustrerad platshållarbild för ${game.title}`}
        />
        <span className="hero-label">{game.category}</span>
        <button
          className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
          aria-label={
            isFavorite ? 'Ta bort från favoriter' : 'Lägg till i favoriter'
          }
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(game.id)}
        >
          <Icon name="heart" size={19} />
        </button>
        <span className="hero-placeholder">PLATSHÅLLARBILD</span>
      </div>
      <div className="detail-content">
        <p className="detail-edition">
          {game.edition || 'UR WILLIAMS SAMLING'}
        </p>
        <h2>{game.title}</h2>
        <div className="stats">
          <div>
            <Icon name="people" />
            <strong>
              {game.playersMin === game.playersMax
                ? game.playersMin
                : `${game.playersMin}–${game.playersMax}`}
            </strong>
            <span>spelare*</span>
          </div>
          <div>
            <Icon name="clock" />
            <strong>{game.minutes} min</strong>
            <span>speltid*</span>
          </div>
          <div>
            <Icon name="mountain" />
            <strong>
              {game.weight.toFixed(1)} <small>/ 5</small>
            </strong>
            <span>svårighet*</span>
          </div>
        </div>
        <p className="data-note">
          * Exempelvärden – ersätts med verifierad speldata.
        </p>
        <div
          className="detail-tabs"
          role="tablist"
          aria-label="Spelinformation"
        >
          {['Om spelet', 'Bilder'].map((t) => (
            <button
              key={t}
              role="tab"
              id={`tab-${t === 'Bilder' ? 'images' : 'about'}`}
              aria-controls="detail-tab-panel"
              aria-selected={tab === t}
              onClick={() => onTabChange(t)}
            >
              {t}
              {t === 'Bilder' && <span>2</span>}
            </button>
          ))}
        </div>
        <div
          id="detail-tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab === 'Bilder' ? 'images' : 'about'}`}
        >
          {tab === 'Om spelet' ? (
            <div className="about">
              <p>{game.description}</p>
              <div className="tags">
                <span>{game.category}</span>
                <span>Brädspel</span>
              </div>
              <div className="preview-note">
                <Icon name="book" size={18} />
                <p>
                  Här finns snart dina bilder, spelbeskrivningar och detaljer.
                </p>
              </div>
            </div>
          ) : (
            <GameGallery game={game} onOpenImage={onOpenImage} />
          )}
        </div>
      </div>
      <div className="detail-footer">
        <span className="tiny-dot" /> I samlingen{' '}
        <span>#{String(collectionIndex).padStart(3, '0')}</span>
      </div>
    </aside>
  );
}
