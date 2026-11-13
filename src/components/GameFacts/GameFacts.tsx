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
  const interactionHelp = useId();
  const players =
    game.playersMin == null || game.playersMax == null
      ? 'Uppgift saknas'
      : game.playersMin === game.playersMax
        ? String(game.playersMin)
        : `${game.playersMin}–${game.playersMax}`;
  return (
    <div>
      <dl className={styles.facts}>
        <div>
          <dt>Spelare</dt>
          <dd>{players}</dd>
        </div>
        <div>
          <dt>Bäst med</dt>
          <dd>{game.bestWith ?? 'Uppgift saknas'}</dd>
        </div>
        <div>
          <dt>Svårighetsgrad</dt>
          <dd>
            {game.weight == null ? (
              'Uppgift saknas'
            ) : (
              <span
                className={styles.difficulty}
                style={{ color: difficultyColor(game.weight) }}
              >
                {game.weight.toLocaleString('sv-SE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                /5
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>Spelarinteraktion</dt>
          <dd aria-describedby={interactionHelp}>
            {game.playerInteraction == null ? (
              'Uppgift saknas'
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
            <dt>Speltid</dt>
            <dd>{game.minutes} min</dd>
          </div>
        )}
        {game.minimumAge != null && (
          <div>
            <dt>Ålder</dt>
            <dd>Från {game.minimumAge} år</dd>
          </div>
        )}
      </dl>
      <p id={interactionHelp} className={styles.help}>
        Spelarinteraktion är vår subjektiva bedömning (0–5) av både samarbete
        och konkurrens.
      </p>
    </div>
  );
}
