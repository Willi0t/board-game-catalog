import GameFacts from '../GameFacts/GameFacts';
import GameMetadata from '../GameMetadata/GameMetadata';
import { useId, type RefObject } from 'react';
import type { Game, GalleryImage } from '../../types/game';
import useModalDialog from '../../hooks/useModalDialog';
import Icon from '../Icon/Icon';
import GameGallery from '../GameGallery/GameGallery';
import GameImage from '../GameImage/GameImage';
import { getCoverImage, getHeroImage } from '../../utils/gameImages';
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
  const dialogRef = useModalDialog({ openerRef, fallbackRef });
  return (
    <dialog
      ref={dialogRef}
      className={styles.drawer}
      aria-modal="true"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
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
            <div>
              <p className={styles.category}>{game.category}</p>
              <h2 id={titleId}>{game.title}</h2>
              {game.edition && <p>{game.edition}</p>}
            </div>
          </div>
          <GameFacts game={game} />
          <GameMetadata game={game} />
          {(game.longDescription || game.description) && (
            <section className={styles.section}>
              <h3>Om spelet</h3>
              {game.descriptionStatus === 'draft' && (
                <p className={styles.note}>Beskrivningen är ett utkast.</p>
              )}
              <p className={styles.description}>
                {game.longDescription || game.description}
              </p>
            </section>
          )}
          <section className={styles.section}>
            <h3>Bilder</h3>
            <p className={styles.note}>
              Välj en bild för att förstora. Reservillustrationer är markerade
              som platshållare.
            </p>
            <GameGallery game={game} onOpenImage={onOpenImage} />
          </section>
          {game.edition && (
            <section className={styles.section}>
              <h3>Min utgåva</h3>
              <p>{game.edition}</p>
            </section>
          )}
          {game.expansions && game.expansions.length > 0 && (
            <section className={styles.section}>
              <h3>Expansioner</h3>
              <ul>
                {game.expansions.map((expansion, index) => (
                  <li key={`${expansion}-${index}`}>{expansion}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </dialog>
  );
}
