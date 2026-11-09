import React from 'react';
import Icon from '../Icon/Icon';

import styles from './Header.module.css';

interface HeaderProps {
  category: string;
  hasGames: boolean;
  onRandomGame: () => void;
  children: React.ReactNode;
  contentClassName: string;
}
export default function Header({
  category,
  hasGames,
  onRandomGame,
  children,
  contentClassName,
}: HeaderProps) {
  return (
    <>
      <header className={styles['topbar']}>
        <div className={styles['breadcrumb']}>
          Mitt bibliotek <Icon name="chevron" size={13} />
          <span>{category}</span>
        </div>
        <span className={styles['demo-label']}>
          <span /> Förhandsversion
        </span>
      </header>
      <div className={contentClassName}>
        <section className={styles['page-heading']}>
          <div>
            <p className={styles['eyebrow']}>SAMLINGEN, PÅ ETT STÄLLE</p>
            <h1 className={styles.heading}>
              {category === 'Alla spel'
                ? 'Nästa spelkväll börjar här.'
                : category}
            </h1>
            <p className={styles['intro']}>
              Bläddra, upptäck och hitta något att samlas kring.
            </p>
          </div>
          <button
            className={styles['random-button']}
            disabled={!hasGames}
            onClick={onRandomGame}
          >
            <Icon name="dice" size={18} />
            Välj åt mig
            <Icon name="arrow" size={17} />
          </button>
        </section>
        {children}
      </div>
    </>
  );
}
