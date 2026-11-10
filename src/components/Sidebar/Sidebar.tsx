import Icon, { type IconName } from '../Icon/Icon';
import { categories } from '../../constants/categories';

import type { Game } from '../../types/game';
import styles from './Sidebar.module.css';

interface SidebarProps {
  games: Game[];
  favorites: string[];
  category: string;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
}
export default function Sidebar({
  games,
  favorites,
  category,
  onCategoryChange,
  onReset,
}: SidebarProps) {
  const libraryItems: [string, IconName, number][] = [
    ['Alla spel', 'grid', games.length],
    ['Favoriter', 'heart', favorites.length],
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
      <p className={styles['nav-caption']}>BIBLIOTEK</p>
      <nav aria-label="Bibliotek">
        {libraryItems.map(([label, icon, count]) => (
          <button
            key={label}
            aria-label={`${label}, ${count} spel`}
            className={`${styles['nav-item']} ${category === label ? styles.active : ''}`}
            onClick={() => onCategoryChange(label)}
            aria-current={category === label ? 'page' : undefined}
          >
            <Icon name={icon} />
            <span>{label}</span>
            <span className={styles['count']}>{count}</span>
          </button>
        ))}
      </nav>
      <p className={`${styles['nav-caption']} ${styles['category-caption']}`}>
        UTFORSKA
      </p>
      <nav aria-label="Spelkategorier">
        {categories.map((c, i) => (
          <button
            key={c}
            className={`${styles['nav-item']} ${styles['category-item']} ${category === c ? styles.active : ''}`}
            aria-current={category === c ? 'page' : undefined}
            onClick={() => onCategoryChange(c)}
          >
            <span
              className={`${styles['category-dot']} ${styles[`dot-${i}`] || ''}`}
            />
            <span>{c}</span>
            <span className={styles['count']}>
              {games.filter((g) => g.category === c).length}
            </span>
          </button>
        ))}
      </nav>
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
