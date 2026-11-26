import { useLanguage } from '../../i18n/LanguageContext';
import type { Game } from '../../types/game';
import styles from './GameDescription.module.css';

interface GameDescriptionProps {
  game: Game;
  presentation?: 'summary' | 'mobile' | 'full';
}

export default function GameDescription({
  game,
  presentation = 'summary',
}: GameDescriptionProps) {
  const { t } = useLanguage();
  const text =
    presentation === 'summary'
      ? game.description
      : game.longDescription || game.description;
  if (!text) return null;
  const draft = game.descriptionStatus === 'draft' && (
    <p className={styles.note}>{t('draftDescription')}</p>
  );
  if (presentation !== 'full')
    return (
      <div className={styles.summary}>
        <p lang="sv">{text}</p>
        {draft}
      </div>
    );
  return (
    <section className={styles.section}>
      <h3>{t('aboutGame')}</h3>
      {draft}
      <p className={styles.description} lang="sv">
        {text}
      </p>
    </section>
  );
}
