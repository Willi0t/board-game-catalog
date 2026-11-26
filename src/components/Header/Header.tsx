import { useLanguage } from '../../i18n/LanguageContext';
import React from 'react';
import { languageNames, type Language } from '../../i18n/translations';
import Icon from '../Icon/Icon';

import styles from './Header.module.css';

const languageFlags = {
  sv: 'se',
  en: 'gb',
  fr: 'fr',
  de: 'de',
  es: 'es',
} satisfies Record<Language, string>;

interface HeaderProps {
  view: 'allGames' | 'favorites' | 'guideResults' | 'aiResults';
  onOpenPicker: (trigger: HTMLButtonElement) => void;
  children: React.ReactNode;
  contentClassName: string;
}
export default function Header({
  view,
  onOpenPicker,
  children,
  contentClassName,
}: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();
  return (
    <>
      <header className={styles['topbar']}>
        <div className={styles['breadcrumb']}>
          {t('myLibrary')} <Icon name="chevron" size={13} />
          <span>{t(view)}</span>
        </div>
        <div
          className={styles.languages}
          role="group"
          aria-label={t('language')}
        >
          {(Object.keys(languageFlags) as Language[]).map((code) => (
            <div className={styles.languageOption} key={code}>
              <button
                type="button"
                className={styles.flag}
                lang={code}
                aria-label={languageNames[code]}
                aria-pressed={language === code}
                onClick={() => setLanguage(code)}
              >
                <img
                  src={`/images/ui/flags/${languageFlags[code]}.svg`}
                  alt=""
                />
              </button>
              <span
                className={styles.languageName}
                lang={code}
                aria-hidden="true"
              >
                {languageNames[code]}
              </span>
            </div>
          ))}
        </div>
      </header>
      <div className={contentClassName}>
        <section className={styles['page-heading']}>
          <div>
            <p className={styles['eyebrow']}>{t('collectionCaption')}</p>
            <h1 className={styles.heading}>
              {view === 'allGames' ? t('browseGames') : t(view)}
            </h1>
            <p className={styles['intro']}>{t('browseIntro')}</p>
          </div>
          <button
            className={styles['random-button']}
            aria-haspopup="dialog"
            aria-label={t('pickForMe')}
            onClick={(event) => onOpenPicker(event.currentTarget)}
          >
            <Icon name="dice" size={18} />
            {t('pickForMe')}
            <Icon name="arrow" size={17} />
          </button>
        </section>
        {children}
      </div>
    </>
  );
}
