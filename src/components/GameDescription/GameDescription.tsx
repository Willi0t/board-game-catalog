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
  if (!text?.trim()) return null;
  const paragraphs = text
    .split(/\r?\n(?:[^\S\r\n]*\r?\n)+/)
    .map((paragraph, index) => (
      <p
        key={index}
        className={styles.description}
        lang={game.descriptionLanguage ?? 'sv'}
      >
        {paragraph}
      </p>
    ));
  const draft = game.descriptionStatus === 'draft' && (
    <p className={styles.note}>{t('draftDescription')}</p>
  );
  if (presentation !== 'full')
    return (
      <div className={styles.summary}>
        {paragraphs}
        {draft}
      </div>
    );
  return (
    <section className={styles.section}>
      <h3>{t('aboutGame')}</h3>
      {draft}
      {paragraphs}
    </section>
  );
}
