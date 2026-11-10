import GameTypeBadges from '../GameTypeBadges/GameTypeBadges';
import GameFacts from '../GameFacts/GameFacts';
import GameDescription from '../GameDescription/GameDescription';
import GameEditionDetails from '../GameEditionDetails/GameEditionDetails';
import GameMetadata from '../GameMetadata/GameMetadata';
import { useId, type RefObject } from 'react';
import type { Game, GalleryImage } from '../../types/game';
import useModalDialog from '../../hooks/useModalDialog';
import Icon from '../Icon/Icon';
import GameGallery from '../GameGallery/GameGallery';
import GameImage from '../GameImage/GameImage';
import {
  getCoverImage,
  getHeroImage,
  getGalleryImages,
} from '../../utils/gameImages';
import styles from './GameDetailDrawer.module.css';

interface GameDetailDrawerProps {
  game: Game;
  onClose: () => void;
  onOpenImage: (image: GalleryImage, trigger: HTMLButtonElement) => void;
  openerRef: RefObject<HTMLElement | null>;
  fallbackRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
}

export default function GameDetailDrawer({
  game,
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
            <GameImage
              image={getHeroImage(game)}
              className={styles.heroImage}
              placeholderLabel="PLATSHÅLLARBILD · Spelet uppdukat"
              labelClassName={styles.caption}
            />
          </figure>
          <div className={styles.identity}>
            <figure className={styles.cover}>
              <GameImage
                image={getCoverImage(game)}
                className={styles.coverImage}
                placeholderLabel="Platshållaromslag"
                labelClassName={styles.caption}
              />
            </figure>
            <div className={styles.identityText}>
              <GameTypeBadges gameTypes={game.gameTypes} />
              <h2 id={titleId}>{game.title}</h2>
              {game.edition && <p>{game.edition}</p>}
            </div>
          </div>
          <GameFacts game={game} />
          <GameMetadata game={game} />
          <GameDescription game={game} presentation="full" />
          <section className={styles.section}>
            <h3>Bilder</h3>
            <p className={styles.note}>
              Välj en bild för att förstora. Reservillustrationer är markerade
              som platshållare.
            </p>
            <GameGallery
              images={getGalleryImages(game)}
              onOpenImage={onOpenImage}
            />
          </section>
          <GameEditionDetails game={game} />
        </div>
      </div>
    </dialog>
  );
}
