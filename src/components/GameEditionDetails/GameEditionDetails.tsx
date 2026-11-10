import type { Game } from '../../types/game';
import styles from './GameEditionDetails.module.css';

export default function GameEditionDetails({ game }: { game: Game }) {
  return (
    <>
      {game.edition && (
        <section className={styles.section}>
          <h3>Min utgåva</h3>
          <p>{game.edition}</p>
        </section>
      )}
      {game.expansions && game.expansions.length > 0 && (
        <section className={styles.section}>
          <h3>Expansioner</h3>
          <ul>
            {game.expansions.map((expansion, index) => (
              <li key={`${expansion}-${index}`}>{expansion}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
