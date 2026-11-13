import styles from './GameExpansions.module.css';
import metadataStyles from '../GameMetadata/GameMetadata.module.css';

interface GameExpansionsProps {
  expansions?: readonly string[];
  compact?: boolean;
  className?: string;
  panel?: boolean;
}

export default function GameExpansions({
  expansions,
  compact = false,
  className,
  panel = false,
}: GameExpansionsProps) {
  if (!expansions?.length) return null;

  if (compact)
    return (
      <span className={styles.count}>
        {expansions.length}{' '}
        {expansions.length === 1 ? 'expansion' : 'expansioner'}
      </span>
    );

  return (
    <section
      className={[panel ? styles.panelSection : styles.section, className]
        .filter(Boolean)
        .join(' ')}
    >
      <h3 className={panel ? metadataStyles.heading : undefined}>
        Expansioner
      </h3>
      <ul className={panel ? metadataStyles.chips : styles.list}>
        {expansions.map((expansion, index) => (
          <li key={`${expansion}-${index}`}>{expansion}</li>
        ))}
      </ul>
    </section>
  );
}
