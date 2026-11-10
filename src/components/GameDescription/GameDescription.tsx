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
  const text =
    presentation === 'summary'
      ? game.description
      : game.longDescription || game.description;
  if (!text) return null;
  const draft = game.descriptionStatus === 'draft' && (
    <p className={styles.note}>Beskrivningen är ett utkast.</p>
  );
  if (presentation !== 'full')
    return (
      <div className={styles.summary}>
        <p>{text}</p>
        {draft}
      </div>
    );
  return (
    <section className={styles.section}>
      <h3>Om spelet</h3>
      {draft}
      <p className={styles.description}>{text}</p>
    </section>
  );
}
