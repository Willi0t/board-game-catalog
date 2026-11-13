import GameBanner from '../GameBanner/GameBanner';
import GameFacts from '../GameFacts/GameFacts';
import GameDescription from '../GameDescription/GameDescription';
import GameExpansions from '../GameExpansions/GameExpansions';
import GameEditionDetails from '../GameEditionDetails/GameEditionDetails';
import GameMetadata from '../GameMetadata/GameMetadata';
import GameStatus from '../GameStatus/GameStatus';
import Icon from '../Icon/Icon';
import GameGallery from '../GameGallery/GameGallery';
import { getGalleryImages, getCoverImage } from '../../utils/gameImages';

import type { Game, GalleryImage, DetailTab } from '../../types/game';
import styles from './GameDetails.module.css';

interface GameDetailsProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  onOpenImage: (
    image: GalleryImage,
    trigger: HTMLButtonElement,
    images?: readonly GalleryImage[],
  ) => void;
  collectionIndex: number;
  onShowMore?: (game: Game, trigger: HTMLButtonElement) => void;
}
export default function GameDetails({
  game,
  isFavorite,
  onToggleFavorite,
  tab,
  onTabChange,
  onOpenImage,
  collectionIndex,
  onShowMore,
}: GameDetailsProps) {
  const galleryImages = onShowMore
    ? getGalleryImages(game)
    : [getCoverImage(game), ...getGalleryImages(game)];
  const tabs: DetailTab[] = ['Om spelet', 'Bilder'];
  return (
    <aside
      className={styles['details']}
      aria-label="Information om valt spel"
      key={game.id}
    >
      <GameBanner
        game={game}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
      <div className={styles['detail-content']}>
        <p className={styles['detail-edition']}>
          {game.edition || 'SPELINFORMATION'}
        </p>
        <h2>{game.title}</h2>
        <div className={styles.status}>
          <GameStatus game={game} />
        </div>
        <GameFacts game={game} />
        <div
          className={styles['detail-tabs']}
          role="tablist"
          aria-label="Spelinformation"
        >
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              id={`tab-${t === 'Bilder' ? 'images' : 'about'}`}
              aria-controls="detail-tab-panel"
              aria-selected={tab === t}
              onClick={() => onTabChange(t)}
            >
              {t}
              {t === 'Bilder' && <span>{galleryImages.length}</span>}
            </button>
          ))}
        </div>
        <div
          id="detail-tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab === 'Bilder' ? 'images' : 'about'}`}
        >
          {tab === 'Om spelet' ? (
            <>
              <GameDescription
                game={game}
                presentation={onShowMore ? 'summary' : 'mobile'}
              />
              <GameMetadata game={game} showStatus={false} />
              {onShowMore ? (
                <GameExpansions expansions={game.expansions} />
              ) : (
                <GameEditionDetails game={game} />
              )}
            </>
          ) : (
            <GameGallery images={galleryImages} onOpenImage={onOpenImage} />
          )}
        </div>
      </div>
      {onShowMore && (
        <div className={styles.actions}>
          <button
            className={styles.more}
            aria-haspopup="dialog"
            onClick={(event) => onShowMore(game, event.currentTarget)}
          >
            Visa mer <Icon name="arrow" size={17} />
          </button>
        </div>
      )}
      <div className={styles['detail-footer']}>
        <GameStatus game={game} />
        <span>#{String(collectionIndex).padStart(3, '0')}</span>
      </div>
    </aside>
  );
}
