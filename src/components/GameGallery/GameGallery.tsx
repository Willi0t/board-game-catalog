import { useState } from 'react';
import Icon from '../Icon/Icon';
import GameImage from '../GameImage/GameImage';
import type { GalleryImage } from '../../types/game';
import styles from './GameGallery.module.css';

interface GalleryItemProps {
  image: GalleryImage;
  onOpenImage: (image: GalleryImage, trigger: HTMLButtonElement) => void;
}

function GalleryItem({ image, onOpenImage }: GalleryItemProps) {
  const [available, setAvailable] = useState(true);
  const [ready, setReady] = useState(false);
  if (!available) return null;
  return (
    <button
      disabled={!ready}
      onClick={(event) => onOpenImage(image, event.currentTarget)}
    >
      <GameImage
        image={image}
        className={styles.image}
        placeholderLabel="Platshållarbild"
        labelClassName={styles.placeholder}
        onReady={() => setReady(true)}
        onUnavailable={() => setAvailable(false)}
      />
      <span>
        {image.title}
        <Icon name="arrow" size={15} />
      </span>
    </button>
  );
}

interface GameGalleryProps {
  images: readonly GalleryImage[];
  onOpenImage: GalleryItemProps['onOpenImage'];
}

export default function GameGallery({ images, onOpenImage }: GameGalleryProps) {
  return (
    <div className={styles.gallery}>
      {images.map((image, index) => (
        <GalleryItem
          key={JSON.stringify([
            image.gameId,
            image.src,
            image.placeholderSrc,
            index,
          ])}
          image={image}
          onOpenImage={onOpenImage}
        />
      ))}
    </div>
  );
}
