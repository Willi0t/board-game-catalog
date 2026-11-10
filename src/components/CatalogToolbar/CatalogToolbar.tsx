import React from 'react';
import Icon from '../Icon/Icon';
import { categories } from '../../constants/categories';

import styles from './CatalogToolbar.module.css';
import {
  mechanicOptions,
  gameTypeOptions,
  playerOptions,
} from '../../constants/catalogOptions';
import type { Availability } from '../../utils/filterGames';

interface CatalogToolbarProps {
  query: string;
  category: string;
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
  onCategoryChange: (category: string) => void;
  onPlayersChange: (players: string) => void;
  onDurationChange: (duration: string) => void;
}
export default function CatalogToolbar({
  query,
  category,
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
  onCategoryChange,
  onPlayersChange,
  onDurationChange,
}: CatalogToolbarProps) {
  return (
    <div className={styles['toolbar']}>
      <label className={styles['search']}>
        <Icon name="search" size={19} />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Sök efter ett spel…"
          aria-label="Sök efter ett spel"
        />
        {query && (
          <button aria-label="Rensa sökning" onClick={() => onQueryChange('')}>
            <Icon name="close" size={15} />
          </button>
        )}
      </label>
      <div className={styles['filters']}>
        <select
          className={styles['mobile-category']}
          aria-label="Välj spelkategori"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {['Alla spel', 'Favoriter', ...categories].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Filtrera antal spelare"
          value={players}
          onChange={(e) => onPlayersChange(e.target.value)}
        >
          <option value="">Alla spelarantal</option>
          {playerOptions.map((n) => (
            <option key={n} value={n}>
              {n} spelare
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrera speltid"
          value={duration}
          onChange={(e) => onDurationChange(e.target.value)}
        >
          <option value="">Alla speltider</option>
          <option value="30">Upp till 30 min</option>
          <option value="60">Upp till 60 min</option>
          <option value="120">Upp till 120 min</option>
        </select>
        <select
          aria-label="Filtrera spelmekanik"
          value={mechanic}
          onChange={(event) => onMechanicChange(event.target.value)}
        >
          <option value="">Alla spelmekaniker</option>
          {mechanicOptions.map((tag) => (
            <option key={tag}>{tag}</option>
          ))}
        </select>
        <select
          aria-label="Filtrera speltyp"
          value={gameType}
          onChange={(event) => onGameTypeChange(event.target.value)}
        >
          <option value="">Alla speltyper</option>
          {gameTypeOptions.map((tag) => (
            <option key={tag}>{tag}</option>
          ))}
        </select>
        <select
          aria-label="Filtrera tillgänglighet"
          value={availability}
          onChange={(event) => {
            const value = event.target.value;
            if (value === 'all' || value === 'owned' || value === 'upcoming')
              onAvailabilityChange(value);
          }}
        >
          <option value="all">Alla</option>
          <option value="owned">I samlingen</option>
          <option value="upcoming">Kommande</option>
        </select>
        <button className={styles.reset} onClick={onReset}>
          Återställ filter
        </button>
      </div>
    </div>
  );
}
