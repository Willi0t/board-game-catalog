import React from 'react';
import Icon from '../Icon/Icon';

import type { Game, GalleryImage } from '../../types/game';
import styles from './GameGallery.module.css';

interface GameGalleryProps {
  game: Game;
  onOpenImage: (image: GalleryImage, trigger: HTMLButtonElement) => void;
}
export default function GameGallery({ game, onOpenImage }: GameGalleryProps) {
  return (
    <div className={styles['gallery']}>
      {game.gallery.map((src, i) => (
        <button
          key={src}
          onClick={(event) =>
            onOpenImage(
              {
                src,
                title: i === 0 ? 'Spelet uppdukat' : 'Komponenter',
              },
              event.currentTarget,
            )
          }
        >
          <img
            src={src}
            alt={`Platshållare: ${i === 0 ? 'spelet uppdukat' : 'komponenter'}`}
          />
          <span>
            {i === 0 ? 'Spelet uppdukat' : 'Komponenter'}
            <Icon name="arrow" size={15} />
          </span>
        </button>
      ))}
    </div>
  );
}
