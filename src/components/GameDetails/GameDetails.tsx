import { useLanguage } from '../../i18n/LanguageContext';
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
  const { t } = useLanguage();
  const galleryImages = [getCoverImage(game, t), ...getGalleryImages(game, t)];
  const tabs: DetailTab[] = ['about', 'images'];
  return (
    <aside
      className={styles['details']}
      aria-label={t('selectedGameInfo')}
      key={game.id}
    >
      <GameBanner
        game={game}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
      <div className={styles['detail-content']}>
        <p className={styles['detail-edition']}>
          {game.edition || t('retailEdition')}
        </p>
        <h2>{game.title}</h2>
        <div className={styles.status}>
          <GameStatus game={game} />
        </div>
        <GameFacts game={game} />
        <div
          className={styles['detail-tabs']}
          role="tablist"
          aria-label={t('gameInformation')}
        >
          {tabs.map((detailTab) => (
            <button
              key={detailTab}
              role="tab"
              id={`tab-${detailTab}`}
              aria-controls="detail-tab-panel"
              aria-selected={tab === detailTab}
              onClick={() => onTabChange(detailTab)}
            >
              {detailTab === 'images' ? t('images') : t('aboutGame')}
              {detailTab === 'images' && <span>{galleryImages.length}</span>}
            </button>
          ))}
        </div>
        <div
          id="detail-tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
        >
          {tab === 'about' ? (
            <>
              <GameDescription
                game={game}
                presentation={onShowMore ? 'summary' : 'mobile'}
              />
              <GameMetadata game={game} showStatus={false} />
              {onShowMore ? (
                <GameExpansions
                  panel
                  expansions={game.expansions}
                  className={styles.expansions}
                />
              ) : (
                <GameEditionDetails
                  panel
                  game={game}
                  expansionsClassName={styles.expansions}
                />
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
            {t('showDetails')} <Icon name="arrow" size={17} />
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
