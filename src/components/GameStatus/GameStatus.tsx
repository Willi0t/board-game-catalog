import { useLanguage } from '../../i18n/LanguageContext';
import type { Game } from '../../types/game';
import styles from './GameStatus.module.css';

export default function GameStatus({ game }: { game: Game }) {
  const { t } = useLanguage();
  if (game.upcoming === undefined) return null;
  return (
    <span
      className={`${styles.status} ${game.upcoming ? styles.upcoming : styles.owned}`}
    >
      {game.upcoming ? t('upcoming') : t('owned')}
    </span>
  );
}
