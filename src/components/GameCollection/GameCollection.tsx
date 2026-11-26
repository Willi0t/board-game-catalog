import { useLanguage } from '../../i18n/LanguageContext';
import Icon from '../Icon/Icon';
import GameCard from '../GameCard/GameCard';

import type { Game } from '../../types/game';
import styles from './GameCollection.module.css';

interface GameCollectionProps {
  games: Game[];
  selectedGame: Game | undefined;
  favorites: string[];
  sort: string;
  onSortChange?: (sort: string) => void;
  onSelectGame: (game: Game, trigger: HTMLButtonElement) => void;
  onOpenDetails: (game: Game, trigger: HTMLButtonElement) => void;
  onReset: (trigger: HTMLButtonElement) => void;
  isPickerResult?: boolean;
}
export default function GameCollection({
  games,
  selectedGame,
  favorites,
  sort,
  onSortChange,
  onSelectGame,
  onOpenDetails,
  onReset,
  isPickerResult = false,
}: GameCollectionProps) {
  const { t } = useLanguage();
  return (
    <section className={styles['collection']} aria-label={t('collection')}>
      <div className={styles['collection-heading']}>
        <p>
          <strong>{games.length}</strong> {t('gamesToDiscover')}
        </p>
        {onSortChange && (
          <select
            value={sort}
            aria-label={t('sortGames')}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="default">{t('sortDefault')}</option>
            <option value="name">{t('sortName')}</option>
            <option value="time">{t('shortestTime')}</option>
          </select>
        )}
      </div>
      {games.length ? (
        <div className={styles['game-grid']}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isSelected={selectedGame?.id === game.id}
              isFavorite={favorites.includes(game.id)}
              onSelectGame={onSelectGame}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        <div className={styles['empty']}>
          <Icon name="search" size={34} />
          <h2>{isPickerResult ? t('noGuideMatches') : t('noGamesFound')}</h2>
          <p>{t('tryOtherFilters')}</p>
          <button onClick={(event) => onReset(event.currentTarget)}>
            {isPickerResult ? t('editChoices') : t('showAllGames')}
          </button>
        </div>
      )}
      <p className={styles['collection-footnote']}>{t('placeholderNotice')}</p>
    </section>
  );
}
