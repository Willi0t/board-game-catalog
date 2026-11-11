import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { GalleryImage } from '../../types/game';
import styles from './GameImage.module.css';
import { layoutCoverTitle } from '../../utils/coverTitle';
import { getBannerMask } from '../../utils/bannerMask';

interface GameImageProps {
  image: GalleryImage;
  className?: string;
  loading?: 'lazy' | 'eager';
  blurredBackdrop?: boolean;
  bannerControls?: ReactNode;
  placeholderLabel?: string;
  label?: string;
  labelClassName?: string;
  onReady?: () => void;
  onUnavailable?: () => void;
}

function ResolvedGameImage({
  image,
  className = '',
  loading,
  blurredBackdrop = false,
  bannerControls,
  placeholderLabel,
  label,
  labelClassName = '',
  onReady,
  onUnavailable,
}: GameImageProps) {
  const [stage, setStage] = useState<'image' | 'placeholder' | 'unavailable'>(
    image.src && image.src !== image.placeholderSrc ? 'image' : 'placeholder',
  );
  const isPlaceholder = stage !== 'image';
  const visualRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [mask, setMask] = useState<string>();
  const updateMask = useCallback(() => {
    const visual = visualRef.current;
    const img = imageRef.current;
    if (!blurredBackdrop || stage !== 'image' || !visual || !img) return;
    setMask(
      getBannerMask(
        visual.clientWidth,
        visual.clientHeight,
        img.naturalWidth,
        img.naturalHeight,
      ),
    );
  }, [blurredBackdrop, stage]);
  useEffect(() => {
    if (!blurredBackdrop || !visualRef.current) return;
    const observer = new ResizeObserver(updateMask);
    observer.observe(visualRef.current);
    return () => observer.disconnect();
  }, [blurredBackdrop, updateMask]);
  const titleLayout = layoutCoverTitle(image.gameTitle);
  const placeholderStyle: CSSProperties & { '--placeholder-tint': string } = {
    '--placeholder-tint': image.placeholderTint ?? 'var(--tint, #eadce2)',
  };
  const visibleLabel = isPlaceholder
    ? (placeholderLabel ?? 'Platshållarbild')
    : label;
  const alt = isPlaceholder
    ? `Platshållarillustration: ${image.title} för ${image.gameTitle}`
    : image.alt || `${image.title} för ${image.gameTitle}`;
  return (
    <div
      className={`${styles.frame} ${blurredBackdrop ? styles.bannerFrame : ''} ${className}`}
      style={placeholderStyle}
      data-placeholder={isPlaceholder}
      data-image-kind={image.kind}
    >
      {blurredBackdrop && !isPlaceholder && (
        <img
          className={styles.backdrop}
          src={image.src}
          alt=""
          aria-hidden="true"
          loading={loading}
        />
      )}
      {blurredBackdrop && bannerControls}
      <div
        ref={visualRef}
        className={`${styles.visual} ${blurredBackdrop ? styles.bannerVisual : ''}`}
      >
        {stage === 'unavailable' ? (
          <div className={styles.unavailable} role="img" aria-label={alt}>
            <span>Bild saknas</span>
            <span>{image.gameTitle}</span>
          </div>
        ) : (
          <>
            <img
              ref={imageRef}
              className={blurredBackdrop ? styles.foreground : undefined}
              style={
                blurredBackdrop && !isPlaceholder
                  ? { maskImage: mask, WebkitMaskImage: mask }
                  : undefined
              }
              src={stage === 'image' ? image.src : image.placeholderSrc}
              alt={alt}
              loading={loading}
              onLoad={() => {
                updateMask();
                onReady?.();
              }}
              onError={() => {
                if (stage === 'image') setStage('placeholder');
                else {
                  setStage('unavailable');
                  onUnavailable?.();
                }
              }}
            />
            {isPlaceholder && image.kind === 'cover' && (
              <svg
                className={styles.title}
                viewBox="0 0 600 760"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                <text
                  x="300"
                  y={titleLayout.firstY}
                  textAnchor="middle"
                  fontFamily="Georgia,serif"
                  fontSize={titleLayout.fontSize}
                  fill="#31312f"
                >
                  {titleLayout.lines.map((line, index) => (
                    <tspan
                      key={index}
                      x="300"
                      dy={index === 0 ? 0 : titleLayout.lineHeight}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </svg>
            )}
          </>
        )}
      </div>
      {visibleLabel && (
        <span className={labelClassName || styles.badge}>{visibleLabel}</span>
      )}
    </div>
  );
}

export default function GameImage(props: GameImageProps) {
  const { image } = props;
  // Remount only the loader state when the game or either source changes.
  return (
    <ResolvedGameImage
      key={JSON.stringify([
        image.gameId,
        image.gameTitle,
        image.kind,
        image.src,
        image.placeholderSrc,
      ])}
      {...props}
    />
  );
}
