import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { flushSync } from 'react-dom';
import useMediaQuery from '../../hooks/useMediaQuery';
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
  // Unbounded keys keep each image mounted as it moves between layers, including wraparound.
  const [cursor, setCursor] = useState(() =>
    Math.max(0, slides.indexOf(modal)),
  );
  const index = ((cursor % slides.length) + slides.length) % slides.length;
  const active = slides[index];
  const canNavigate = slides.length > 1;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const compact = useMediaQuery('(max-width: 800px)');
  const stageRef = useRef<HTMLDivElement>(null);
  const motion = useRef<{
    busy: boolean;
    queue: number[];
    animations: Animation[];
  }>({ busy: false, queue: [], animations: [] });
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const controller = motion.current;
    return () => {
      mounted.current = false;
      controller.animations.forEach((animation) => animation.cancel());
    };
  }, []);
  useEffect(() => {
    if (reducedMotion)
      motion.current.animations.forEach((animation) => animation.finish());
  }, [reducedMotion]);
  const visibleOffsets = new Set([
    0,
    ...getCarouselNeighbors(slides.length, index)
      .filter((neighbor) => !compact || Math.abs(neighbor.offset) === 1)
      .map((neighbor) => neighbor.offset),
  ]);
  const position = (offset: number) => {
    const depth = Math.abs(offset);
    const x =
      offset === 0
        ? -50
        : -50 +
          Math.sign(offset) *
            (depth === 1 ? (compact ? 40 : 50) : depth === 2 ? 92 : 125);
    const y = depth === 1 ? (compact ? 16 : 24) : depth >= 2 ? -24 : 0;
    return {
      transform: `translate(${x}%, calc(-50% + ${y}px)) scale(${depth === 0 ? 1 : depth === 1 ? 0.84 : 0.64})`,
      opacity: !visibleOffsets.has(offset)
        ? 0
        : depth === 0
          ? 1
          : depth === 1
            ? 0.8
            : depth === 2 && !compact
              ? 0.48
              : 0,
    };
  };
  const [aspect, setAspect] = useState(1.45);
  const aspectReady = useRef(false);
  const stageStyle: CSSProperties & { '--slide-ratio': number } = {
    '--slide-ratio': aspect,
  };
  const navigate = (step: number) => {
    const controller = motion.current;
    if (controller.busy) {
      controller.queue.push(step);
      return;
    }
    const move = (direction: number) => {
      if (!mounted.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const total =
          direction + controller.queue.reduce((sum, item) => sum + item, 0);
        controller.queue = [];
        controller.busy = false;
        setCursor((current) => current + total);
        return;
      }
      controller.busy = true;
      const layers = Array.from(
        stageRef.current?.querySelectorAll<HTMLElement>(
          '[data-slide-offset]',
        ) ?? [],
      );
      controller.animations = layers.map((layer) => {
        const offset = Number(layer.dataset.slideOffset);
        layer.style.zIndex = String(
          4 - Math.min(Math.abs(offset), Math.abs(offset - direction)),
        );
        return layer.animate([position(offset), position(offset - direction)], {
          duration: 280,
          easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
          fill: 'forwards',
        });
      });
      void Promise.all(
        controller.animations.map((animation) => animation.finished),
      )
        .then(() => {
          if (!mounted.current) return;
          flushSync(() => setCursor((current) => current + direction));
          controller.animations.forEach((animation) => animation.cancel());
          controller.animations = [];
          layers.forEach((layer) => {
            layer.style.zIndex = String(
              4 - Math.abs(Number(layer.dataset.slideOffset)),
            );
          });
          controller.busy = false;
          const next = controller.queue.shift();
          if (next !== undefined) move(next);
        })
        .catch(() => {});
    };
    move(step);
  };
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
          ref={stageRef}
          className={styles.stage}
          style={stageStyle}
          data-single={!canNavigate}
          role="group"
          aria-label={canNavigate ? 'Bläddra bland bilder' : 'Bild'}
        >
          {(canNavigate ? [-3, -2, -1, 0, 1, 2, 3] : [0]).map((offset) => {
            const target =
              (index + (offset % slides.length) + slides.length) %
              slides.length;
            return (
              <button
                key={cursor + offset}
                className={styles.slide}
                data-slide-offset={offset}
                data-depth={
                  visibleOffsets.has(offset) && offset !== 0
                    ? Math.abs(offset)
                    : undefined
                }
                style={{ ...position(offset), zIndex: 4 - Math.abs(offset) }}
                tabIndex={offset !== 0 && visibleOffsets.has(offset) ? 0 : -1}
                disabled={offset === 0 || !visibleOffsets.has(offset)}
                aria-hidden={!visibleOffsets.has(offset)}
                aria-label={
                  !visibleOffsets.has(offset)
                    ? undefined
                    : offset === 0
                      ? slides[target].title
                      : `Visa ${offset < 0 ? 'föregående' : 'nästa'} bild: ${slides[target].title}`
                }
                onClick={() => {
                  for (let step = 0; step < Math.abs(offset); step++)
                    navigate(Math.sign(offset));
                }}
              >
                <GameImage
                  image={slides[target]}
                  className={styles.image}
                  placeholderLabel="Platshållarbild"
                  onReady={
                    offset === 0
                      ? () => {
                          const img =
                            stageRef.current?.querySelector<HTMLImageElement>(
                              '[data-slide-offset="0"] img',
                            );
                          if (
                            img?.naturalWidth &&
                            img.naturalHeight &&
                            !motion.current.busy &&
                            !aspectReady.current
                          ) {
                            aspectReady.current = true;
                            setAspect(img.naturalWidth / img.naturalHeight);
                          }
                        }
                      : undefined
                  }
                />
              </button>
            );
          })}
          <div className={styles.mainImage} aria-label="Aktuell bild">
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
