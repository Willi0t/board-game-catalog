import React from 'react';
import Icon from '../Icon/Icon';

import styles from './Header.module.css';

interface HeaderProps {
  viewLabel: string;
  onOpenPicker: (trigger: HTMLButtonElement) => void;
  children: React.ReactNode;
  contentClassName: string;
}
export default function Header({
  viewLabel,
  onOpenPicker,
  children,
  contentClassName,
}: HeaderProps) {
  return (
    <>
      <header className={styles['topbar']}>
        <div className={styles['breadcrumb']}>
          Mitt bibliotek <Icon name="chevron" size={13} />
          <span>{viewLabel}</span>
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
              {viewLabel === 'Alla spel'
                ? 'Nästa spelkväll börjar här.'
                : viewLabel}
            </h1>
            <p className={styles['intro']}>
              Bläddra, upptäck och hitta något att samlas kring.
            </p>
          </div>
          <button
            className={styles['random-button']}
            aria-haspopup="dialog"
            aria-label="Välj åt mig"
            onClick={(event) => onOpenPicker(event.currentTarget)}
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
