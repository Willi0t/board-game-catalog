import { useState, type CSSProperties } from 'react';
import type { GalleryImage } from '../../types/game';
import styles from './GameImage.module.css';
import { layoutCoverTitle } from '../../utils/coverTitle';

interface GameImageProps {
  image: GalleryImage;
  className?: string;
  loading?: 'lazy' | 'eager';
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
      className={`${styles.frame} ${className}`}
      style={placeholderStyle}
      data-placeholder={isPlaceholder}
      data-image-kind={image.kind}
    >
      <div className={styles.visual}>
        {stage === 'unavailable' ? (
          <div className={styles.unavailable} role="img" aria-label={alt}>
            <span>Bild saknas</span>
            <span>{image.gameTitle}</span>
          </div>
        ) : (
          <>
            <img
              src={stage === 'image' ? image.src : image.placeholderSrc}
              alt={alt}
              loading={loading}
              onLoad={onReady}
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
