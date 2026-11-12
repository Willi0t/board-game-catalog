import { useRef, useState, type CSSProperties, type RefObject } from 'react';
import Icon from '../Icon/Icon';
import GameImage from '../GameImage/GameImage';
import useModalDialog from '../../hooks/useModalDialog';
import type { GalleryImage } from '../../types/game';
import styles from './ImageModal.module.css';
import { getCarouselNeighbors } from '../../utils/carouselNeighbors';

interface ImageModalProps {
  modal: GalleryImage;
  images?: readonly GalleryImage[];
  onClose: () => void;
  openerRef: RefObject<HTMLElement | null>;
  fallbackRef: RefObject<HTMLElement | null>;
}

export default function ImageModal({
  modal,
  images = [modal],
  onClose,
  openerRef,
  fallbackRef,
}: ImageModalProps) {
  const dialogProps = useModalDialog({ onClose, openerRef, fallbackRef });
  const slides = images.length ? images : [modal];
  const [index, setIndex] = useState(() => Math.max(0, slides.indexOf(modal)));
  const active = slides[index];
  const canNavigate = slides.length > 1;
  const neighbors = getCarouselNeighbors(slides.length, index);
  const mainRef = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState(1.45);
  const stageStyle: CSSProperties & { '--slide-ratio': number } = {
    '--slide-ratio': aspect,
  };
  const navigate = (step: number) =>
    setIndex((current) => (current + step + slides.length) % slides.length);
  return (
    <dialog
      {...dialogProps}
      className={styles['modal-backdrop']}
      aria-modal="true"
      aria-label={active.title}
      onKeyDown={(event) => {
        if (!canNavigate || !['ArrowLeft', 'ArrowRight'].includes(event.key))
          return;
        event.preventDefault();
        event.stopPropagation();
        navigate(event.key === 'ArrowLeft' ? -1 : 1);
      }}
    >
      <div className={styles.modal}>
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Stäng bild"
        >
          <Icon name="close" />
        </button>
        <div
          className={styles.stage}
          style={stageStyle}
          data-single={!canNavigate}
          role="group"
          aria-label={canNavigate ? 'Bläddra bland bilder' : 'Bild'}
        >
          {neighbors.map(({ index: target, offset }) => (
            <button
              key={offset}
              className={styles.sideImage}
              data-offset={offset}
              data-depth={Math.abs(offset)}
              onClick={() => setIndex(target)}
              aria-label={
                Math.abs(offset) === 1
                  ? `Visa ${offset < 0 ? 'föregående' : 'nästa'} bild: ${slides[target].title}`
                  : `Visa bild ${target + 1}: ${slides[target].title}`
              }
            >
              <GameImage
                image={slides[target]}
                className={styles.previewImage}
              />
            </button>
          ))}
          <div
            ref={mainRef}
            className={styles.mainImage}
            aria-label="Aktuell bild"
          >
            <GameImage
              image={active}
              className={styles.image}
              placeholderLabel="Platshållarbild"
              onReady={() => {
                const img = mainRef.current?.querySelector('img');
                if (img?.naturalWidth && img.naturalHeight)
                  setAspect(img.naturalWidth / img.naturalHeight);
              }}
            />
            {canNavigate && (
              <>
                <button
                  className={styles.previousButton}
                  onClick={() => navigate(-1)}
                  aria-label="Föregående bild"
                >
                  <Icon name="chevron" className={styles.previous} size={18} />
                </button>
                <button
                  className={styles.nextButton}
                  onClick={() => navigate(1)}
                  aria-label="Nästa bild"
                >
                  <Icon name="chevron" size={18} />
                </button>
              </>
            )}
          </div>
        </div>
        <div className={styles.caption} aria-live="polite" aria-atomic="true">
          <p>{active.title}</p>
          <span>
            {index + 1} av {slides.length}
          </span>
        </div>
      </div>
    </dialog>
  );
}
