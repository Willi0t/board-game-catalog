import { useLanguage } from '../../i18n/LanguageContext';
import { useId } from 'react';
import type { Game } from '../../types/game';
import styles from './GameFacts.module.css';

function difficultyColor(weight: number) {
  const position = Math.min(5, Math.max(1, weight));
  const [from, to, progress] =
    position <= 3
      ? ['#286529', '#7a5c00', (position - 1) / 2]
      : ['#7a5c00', '#a62223', (position - 3) / 2];
  return `color-mix(in srgb, ${from}, ${to} ${progress * 100}%)`;
}

export default function GameFacts({ game }: { game: Game }) {
  const { t, language } = useLanguage();
  const interactionHelp = useId();
  const players =
    game.playersMin == null || game.playersMax == null
      ? t('unknown')
      : game.playersMin === game.playersMax
        ? String(game.playersMin)
        : `${game.playersMin}–${game.playersMax}`;
  return (
    <div>
      <dl className={styles.facts}>
        <div>
          <dt>{t('players')}</dt>
          <dd>{players}</dd>
        </div>
        <div>
          <dt>{t('bestWith')}</dt>
          <dd>{game.bestWith ?? t('unknown')}</dd>
        </div>
        <div>
          <dt>{t('difficulty')}</dt>
          <dd>
            {game.weight == null ? (
              t('unknown')
            ) : (
              <span
                className={styles.difficulty}
                style={{ color: difficultyColor(game.weight) }}
              >
                {game.weight.toLocaleString(language, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                /5
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>{t('playerInteraction')}</dt>
          <dd aria-describedby={interactionHelp}>
            {game.playerInteraction == null ? (
              t('unknown')
            ) : (
              <>
                {game.playerInteraction}/5
                <span className={styles.scale} aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <span
                      key={step}
                      className={
                        step <= (game.playerInteraction ?? 0)
                          ? styles.filled
                          : ''
                      }
                    />
                  ))}
                </span>
              </>
            )}
          </dd>
        </div>
        {game.minutes != null && (
          <div>
            <dt>{t('playTime')}</dt>
            <dd>
              {game.minutes} {t('minutes')}
            </dd>
          </div>
        )}
        {game.minimumAge != null && (
          <div>
            <dt>{t('age')}</dt>
            <dd>{t('minimumAge', game.minimumAge)}</dd>
          </div>
        )}
      </dl>
      <p id={interactionHelp} className={styles.help}>
        {t('interactionScale')}
      </p>
    </div>
  );
}
