import { useLanguage } from '../../i18n/LanguageContext';
import Icon from '../Icon/Icon';

import styles from './CatalogToolbar.module.css';
import {
  mechanicOptions,
  gameTypeOptions,
  playerOptions,
} from '../../constants/catalogOptions';
import type { Availability } from '../../utils/filterGames';

interface CatalogToolbarProps {
  query: string;
  players: string;
  duration: string;
  mechanic: string;
  gameType: string;
  availability: Availability;
  onMechanicChange: (value: string) => void;
  onGameTypeChange: (value: string) => void;
  onAvailabilityChange: (value: Availability) => void;
  onReset: () => void;
  onQueryChange: (query: string) => void;
  onPlayersChange: (players: string) => void;
  onDurationChange: (duration: string) => void;
}
export default function CatalogToolbar({
  query,
  players,
  duration,
  mechanic,
  gameType,
  availability,
  onMechanicChange,
  onGameTypeChange,
  onAvailabilityChange,
  onReset,
  onQueryChange,
  onPlayersChange,
  onDurationChange,
}: CatalogToolbarProps) {
  const { t, tagLabel } = useLanguage();
  return (
    <div className={styles['toolbar']}>
      <label className={styles['search']}>
        <Icon name="search" size={19} />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('search')}
        />
        {query && (
          <button
            aria-label={t('clearSearch')}
            onClick={() => onQueryChange('')}
          >
            <Icon name="close" size={15} />
          </button>
        )}
      </label>
      <div className={styles['filters']}>
        <select
          aria-label={t('filterPlayers')}
          value={players}
          onChange={(e) => onPlayersChange(e.target.value)}
        >
          <option value="">{t('allPlayerCounts')}</option>
          {playerOptions.map((n) => (
            <option key={n} value={n}>
              {t('playerCount', n)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('filterDuration')}
          value={duration}
          onChange={(e) => onDurationChange(e.target.value)}
        >
          <option value="">{t('allDurations')}</option>
          <option value="30">{t('upTo30')}</option>
          <option value="60">{t('upTo60')}</option>
          <option value="120">{t('upTo120')}</option>
        </select>
        <select
          aria-label={t('filterMechanic')}
          value={mechanic}
          onChange={(event) => onMechanicChange(event.target.value)}
        >
          <option value="">{t('allMechanics')}</option>
          {mechanicOptions.map((tag) => (
            <option key={tag} value={tag}>
              {tagLabel(tag)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('filterType')}
          value={gameType}
          onChange={(event) => onGameTypeChange(event.target.value)}
        >
          <option value="">{t('allTypes')}</option>
          {gameTypeOptions.map((tag) => (
            <option key={tag} value={tag}>
              {tagLabel(tag)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('filterAvailability')}
          value={availability}
          onChange={(event) => {
            const value = event.target.value;
            if (value === 'all' || value === 'owned' || value === 'upcoming')
              onAvailabilityChange(value);
          }}
        >
          <option value="all">{t('all')}</option>
          <option value="owned">{t('owned')}</option>
          <option value="upcoming">{t('upcoming')}</option>
        </select>
        <button className={styles.reset} onClick={onReset}>
          {t('resetFilters')}
        </button>
      </div>
    </div>
  );
}
