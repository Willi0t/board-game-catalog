import { useLanguage } from '../../i18n/LanguageContext';
import { useState } from 'react';
import GameImage from '../GameImage/GameImage';
import VideoBadge from '../VideoBadge/VideoBadge';
import type { GalleryImage } from '../../types/game';
import styles from './GameGallery.module.css';

interface GalleryItemProps {
  image: GalleryImage;
  onOpenImage: (image: GalleryImage, trigger: HTMLButtonElement) => void;
}

function GalleryItem({ image, onOpenImage }: GalleryItemProps) {
  const { t } = useLanguage();
  const [available, setAvailable] = useState(true);
  const [ready, setReady] = useState(false);
  if (!available) return null;
  return (
    <button
      aria-label={t(image.videoSrc ? 'openVideo' : 'openImage', image.title)}
      disabled={!ready}
      onClick={(event) => onOpenImage(image, event.currentTarget)}
    >
      <GameImage
        image={image}
        className={styles.image}
        placeholderLabel={t('placeholderImage')}
        labelClassName={styles.placeholder}
        onReady={() => setReady(true)}
        onUnavailable={() => setAvailable(false)}
      />
      {image.videoSrc && <VideoBadge />}
    </button>
  );
}

interface GameGalleryProps {
  images: readonly GalleryImage[];
  onOpenImage: (
    image: GalleryImage,
    trigger: HTMLButtonElement,
    images?: readonly GalleryImage[],
  ) => void;
  layout?: 'default' | 'thumbnails';
}

export default function GameGallery({
  images,
  onOpenImage,
  layout = 'default',
}: GameGalleryProps) {
  return (
    <div
      className={`${styles.gallery} ${layout === 'thumbnails' ? styles.thumbnails : ''}`}
    >
      {images.map((image, index) => (
        <GalleryItem
          key={JSON.stringify([
            image.gameId,
            image.src,
            image.placeholderSrc,
            index,
          ])}
          image={image}
          onOpenImage={(selected, trigger) =>
            onOpenImage(selected, trigger, images)
          }
        />
      ))}
    </div>
  );
}
