import { useLanguage } from '../../i18n/LanguageContext';
import type { Game } from '../../types/game';
import GameStatus from '../GameStatus/GameStatus';
import styles from './GameMetadata.module.css';

export default function GameMetadata({
  game,
  showStatus = true,
}: {
  game: Game;
  showStatus?: boolean;
}) {
  const { t, tagLabel } = useLanguage();
  return (
    <div className={styles.metadata}>
      {showStatus && <GameStatus game={game} />}
      {(
        [
          [t('mechanic'), game.mechanics],
          [t('gameType'), game.gameTypes],
        ] as const
      ).map(
        ([label, tags]) =>
          tags.length > 0 && (
            <section key={label}>
              <h3 className={styles.heading}>{label}</h3>
              <ul className={styles.chips}>
                {tags.map((tag) => (
                  <li key={tag}>{tagLabel(tag)}</li>
                ))}
              </ul>
            </section>
          ),
      )}
      {game.catalogMetadata && (
        <div className={styles.quality}>
          <p>{t('catalogCaveat')}</p>
          {game.catalogMetadata.preliminary && <p>{t('preliminary')}</p>}
          {game.catalogMetadata.editionMatch === 'provisional' && (
            <p>{t('parlayCaveat')}</p>
          )}
        </div>
      )}
    </div>
  );
}
