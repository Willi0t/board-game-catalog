import { useLanguage } from '../../i18n/LanguageContext';
import type { Game } from '../../types/game';
import GameExpansions from '../GameExpansions/GameExpansions';
import styles from './GameEditionDetails.module.css';

export default function GameEditionDetails({
  game,
  expansionsClassName,
  panel = false,
}: {
  game: Game;
  expansionsClassName?: string;
  panel?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <>
      {game.edition && (
        <section className={styles.section}>
          <h3>{t('myEdition')}</h3>
          <p>{game.edition}</p>
        </section>
      )}
      <GameExpansions
        panel={panel}
        expansions={game.expansions}
        className={expansionsClassName}
      />
    </>
  );
}
