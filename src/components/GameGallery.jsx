import React from 'react';
import Icon from './Icon';

export default function GameGallery({ game, onOpenImage }) {
  return (
    <div className="gallery">
      {game.gallery.map((src, i) => (
        <button
          key={src}
          onClick={() =>
            onOpenImage({
              src,
              title: i === 0 ? 'Spelet uppdukat' : 'Komponenter',
            })
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
