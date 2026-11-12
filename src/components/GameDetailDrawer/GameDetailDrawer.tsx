import GameBanner from '../GameBanner/GameBanner';
import GameFacts from '../GameFacts/GameFacts';
import GameDescription from '../GameDescription/GameDescription';
import GameEditionDetails from '../GameEditionDetails/GameEditionDetails';
import GameMetadata from '../GameMetadata/GameMetadata';
import { useId, type RefObject } from 'react';
import type { Game, GalleryImage } from '../../types/game';
import useModalDialog from '../../hooks/useModalDialog';
import Icon from '../Icon/Icon';
import GameGallery from '../GameGallery/GameGallery';
import { getGalleryImages } from '../../utils/gameImages';
import styles from './GameDetailDrawer.module.css';

interface GameDetailDrawerProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onOpenImage: (
    image: GalleryImage,
    trigger: HTMLButtonElement,
    images?: readonly GalleryImage[],
  ) => void;
  openerRef: RefObject<HTMLElement | null>;
  fallbackRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
}

export default function GameDetailDrawer({
  game,
  isFavorite,
  onToggleFavorite,
  onClose,
  onOpenImage,
  openerRef,
  fallbackRef,
  panelRef,
}: GameDetailDrawerProps) {
  const titleId = useId();
  const dialogProps = useModalDialog({ onClose, openerRef, fallbackRef });
  return (
    <dialog
      {...dialogProps}
      className={styles.drawer}
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className={styles.panel}>
        <header ref={panelRef} tabIndex={-1} className={styles.header}>
          <span>Spelinformation</span>
          <button
            className={styles.close}
            onClick={onClose}
            aria-label="Stäng spelinformation"
          >
            <Icon name="close" />
          </button>
        </header>
        <div className={styles.content}>
          <figure className={styles.hero}>
            <GameBanner
              game={game}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              className={styles.heroImage}
            />
          </figure>
          <div className={styles.identity}>
            <h2 id={titleId}>{game.title}</h2>
            {game.edition && <p>{game.edition}</p>}
          </div>
          <GameFacts game={game} />
          <GameMetadata game={game} />
          <GameDescription game={game} presentation="full" />
          <GameEditionDetails game={game} />
          <section className={styles.gallerySection} aria-label="Bilder">
            <h3>Bilder</h3>
            <GameGallery
              images={getGalleryImages(game)}
              onOpenImage={onOpenImage}
              layout="thumbnails"
            />
          </section>
        </div>
      </div>
    </dialog>
  );
}
