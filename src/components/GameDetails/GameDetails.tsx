import React from 'react';
import Icon from '../Icon/Icon';
import GameGallery from '../GameGallery/GameGallery';
import GameImage from '../GameImage/GameImage';
import { getHeroImage, getGalleryImages } from '../../utils/gameImages';

import type { Game, GalleryImage, DetailTab } from '../../types/game';
import styles from './GameDetails.module.css';

interface GameDetailsProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  onOpenImage: (image: GalleryImage, trigger: HTMLButtonElement) => void;
  detailsRef: React.Ref<HTMLElement>;
  collectionIndex: number;
  onShowMore: (game: Game, trigger: HTMLButtonElement) => void;
}
export default function GameDetails({
  game,
  isFavorite,
  onToggleFavorite,
  tab,
  onTabChange,
  onOpenImage,
  detailsRef,
  collectionIndex,
  onShowMore,
}: GameDetailsProps) {
  const tabs: DetailTab[] = ['Om spelet', 'Bilder'];
  return (
    <aside
      ref={detailsRef}
      className={styles['details']}
      aria-label="Information om valt spel"
      key={game.id}
    >
      <div className={styles['detail-hero']}>
        <GameImage
          image={getHeroImage(game)}
          className={styles.heroImage}
          placeholderLabel="PLATSHÅLLARBILD"
          labelClassName={styles['hero-placeholder']}
        />
        <span className={styles['hero-label']}>{game.category}</span>
        <button
          className={`${styles['favorite-button']} ${isFavorite ? styles['is-favorite'] : ''}`}
          aria-label={
            isFavorite ? 'Ta bort från favoriter' : 'Lägg till i favoriter'
          }
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(game.id)}
        >
          <Icon name="heart" size={19} />
        </button>
      </div>
      <div className={styles['detail-content']}>
        <p className={styles['detail-edition']}>
          {game.edition || 'UR WILLIAMS SAMLING'}
        </p>
        <h2>{game.title}</h2>
        <div className={styles['stats']}>
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
        <p className={styles['data-note']}>
          * Exempelvärden – ersätts med verifierad speldata.
        </p>
        <div
          className={styles['detail-tabs']}
          role="tablist"
          aria-label="Spelinformation"
        >
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              id={`tab-${t === 'Bilder' ? 'images' : 'about'}`}
              aria-controls="detail-tab-panel"
              aria-selected={tab === t}
              onClick={() => onTabChange(t)}
            >
              {t}
              {t === 'Bilder' && <span>{getGalleryImages(game).length}</span>}
            </button>
          ))}
        </div>
        <div
          id="detail-tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab === 'Bilder' ? 'images' : 'about'}`}
        >
          {tab === 'Om spelet' ? (
            <div className={styles['about']}>
              <p>{game.description}</p>
              <div className={styles['tags']}>
                <span>{game.category}</span>
                <span>Brädspel</span>
              </div>
              <div className={styles['preview-note']}>
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
      <div className={styles.actions}>
        <button
          className={styles.more}
          aria-haspopup="dialog"
          onClick={(event) => onShowMore(game, event.currentTarget)}
        >
          Visa mer <Icon name="arrow" size={17} />
        </button>
      </div>
      <div className={styles['detail-footer']}>
        <span className={styles['tiny-dot']} /> I samlingen{' '}
        <span>#{String(collectionIndex).padStart(3, '0')}</span>
      </div>
    </aside>
  );
}
