import React from 'react';
import Icon from './Icon';
import { categories } from '../constants/categories';

export default function Sidebar({
  games,
  favorites,
  category,
  onCategoryChange,
  onReset,
}) {
  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onReset();
        }}
      >
        <span className="brand-mark">
          <Icon name="dice" size={24} />
        </span>
        <span>
          spelhyllan<span className="brand-dot">.</span>
        </span>
      </a>
      <div className="owner">
        <span className="avatar">W</span>
        <div>
          <strong>Williams samling</strong>
          <span>En värld av spelkvällar</span>
        </div>
      </div>
      <p className="nav-caption">BIBLIOTEK</p>
      <nav aria-label="Bibliotek">
        {[
          ['Alla spel', 'grid', games.length],
          ['Favoriter', 'heart', favorites.length],
        ].map(([label, icon, count]) => (
          <button
            key={label}
            aria-label={`${label}, ${count} spel`}
            className={`nav-item ${category === label ? 'active' : ''}`}
            onClick={() => onCategoryChange(label)}
            aria-current={category === label ? 'page' : undefined}
          >
            <Icon name={icon} />
            <span>{label}</span>
            <span className="count">{count}</span>
          </button>
        ))}
      </nav>
      <p className="nav-caption category-caption">UTFORSKA</p>
      <nav aria-label="Spelkategorier">
        {categories.map((c, i) => (
          <button
            key={c}
            className={`nav-item category-item ${category === c ? 'active' : ''}`}
            aria-current={category === c ? 'page' : undefined}
            onClick={() => onCategoryChange(c)}
          >
            <span className={`category-dot dot-${i}`} />
            <span>{c}</span>
            <span className="count">
              {games.filter((g) => g.category === c).length}
            </span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
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
