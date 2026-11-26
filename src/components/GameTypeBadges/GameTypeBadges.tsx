import { useLanguage } from '../../i18n/LanguageContext';
import type { Game } from '../../types/game';
import styles from './GameTypeBadges.module.css';

export default function GameTypeBadges({
  gameTypes,
  appearance = 'default',
}: Pick<Game, 'gameTypes'> & { appearance?: 'default' | 'banner' }) {
  const { t, tagLabel } = useLanguage();
  if (!gameTypes.length) return null;
  return (
    <ul
      className={`${styles.badges} ${appearance === 'banner' ? styles.banner : ''}`}
      aria-label={t('gameTypes')}
    >
      {gameTypes.map((gameType) => (
        <li key={gameType}>{tagLabel(gameType)}</li>
      ))}
    </ul>
  );
}
