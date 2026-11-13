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
  return (
    <div className={styles.metadata}>
      {showStatus && <GameStatus game={game} />}
      {(
        [
          ['Spelmekanik', game.mechanics],
          ['Speltyp', game.gameTypes],
        ] as const
      ).map(
        ([label, tags]) =>
          tags.length > 0 && (
            <section key={label}>
              <h3 className={styles.heading}>{label}</h3>
              <ul className={styles.chips}>
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </section>
          ),
      )}
      {game.catalogMetadata && (
        <div className={styles.quality}>
          <p>
            Spelarantal och svårighet följer importunderlaget och kan avse
            grundspelet. Exakt utgåva är inte oberoende verifierad. Taggarna är
            vår granskade indelning.
          </p>
          {game.catalogMetadata.preliminary && (
            <p>Uppgifterna kan vara preliminära.</p>
          )}
          {game.catalogMetadata.editionMatch === 'provisional' && (
            <p>
              Preliminär utgåvematchning: Parlay: The Betting Game antas, men
              exakt utgåva är inte bekräftad. Även taggarna är preliminära.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
