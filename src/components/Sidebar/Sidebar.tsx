import { useEffect, useRef } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import { gameTypeTags, mechanicTags } from '../../constants/catalogOptions';
import useMediaQuery from '../../hooks/useMediaQuery';
import type { LibraryView } from '../../utils/filterGames';
import ExploreNavigation from '../ExploreNavigation/ExploreNavigation';

import type { Game } from '../../types/game';
import styles from './Sidebar.module.css';

interface SidebarProps {
  games: Game[];
  favorites: string[];
  libraryView: LibraryView | null;
  gameType: string;
  mechanic: string;
  onLibraryViewChange: (view: LibraryView) => void;
  onGameTypeChange: (value: string) => void;
  onMechanicChange: (value: string) => void;
  onReset: () => void;
}
export default function Sidebar({
  games,
  favorites,
  libraryView,
  gameType,
  mechanic,
  onLibraryViewChange,
  onGameTypeChange,
  onMechanicChange,
  onReset,
}: SidebarProps) {
  const isCompact = useMediaQuery('(max-width: 900px)');
  const exploreRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    // An external selection must also be reachable when the compact menu is closed.
    if (
      (gameType ||
        mechanicTags.findIndex(({ tag }) => tag === mechanic) >= 5) &&
      exploreRef.current
    )
      exploreRef.current.open = true;
  }, [gameType, mechanic, isCompact]);
  const libraryItems: [LibraryView, string, IconName, number][] = [
    ['all', 'Alla spel', 'grid', games.length],
    ['favorites', 'Favoriter', 'heart', favorites.length],
  ];
  return (
    <aside className={styles['sidebar']}>
      <a
        className={styles['brand']}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onReset();
        }}
      >
        <span className={styles['brand-mark']}>
          <Icon name="dice" size={24} />
        </span>
        <span>
          spelhyllan<span className={styles['brand-dot']}>.</span>
        </span>
      </a>
      <div className={styles['owner']}>
        <span className={styles['avatar']}>W</span>
        <div>
          <strong>Williams samling</strong>
          <span>En värld av spelkvällar</span>
        </div>
      </div>
      <p className={`${styles['nav-caption']} ${styles['library-caption']}`}>
        BIBLIOTEK
      </p>
      <nav className={styles.library} aria-label="Bibliotek">
        {libraryItems.map(([view, label, icon, count]) => (
          <button
            key={label}
            aria-label={`${label}, ${count} spel`}
            className={`${styles['nav-item']} ${libraryView === view ? styles.active : ''}`}
            onClick={() => onLibraryViewChange(view)}
            aria-current={libraryView === view ? 'page' : undefined}
          >
            <Icon name={icon} />
            <span className={styles['library-label']}>{label}</span>
            <span className={styles['count']}>{count}</span>
          </button>
        ))}
      </nav>
      <details ref={exploreRef} className={styles.explore} open={!isCompact}>
        <summary>Utforska</summary>
        <div className={styles['tag-lists']}>
          <ExploreNavigation
            gameTypes={gameTypeTags}
            mechanics={mechanicTags}
            gameType={gameType}
            mechanic={mechanic}
            onGameTypeChange={onGameTypeChange}
            onMechanicChange={onMechanicChange}
          />
        </div>
      </details>
      <div className={styles['sidebar-bottom']}>
        <Icon name="sun" size={18} />
        <span>
          Lite mindre skärm.
          <br />
          <strong>Lite mer spelkväll.</strong>
        </span>
      </div>
    </aside>
  );
}
