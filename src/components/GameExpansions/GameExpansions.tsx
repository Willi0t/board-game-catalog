import styles from './GameExpansions.module.css';

interface GameExpansionsProps {
  expansions?: readonly string[];
  compact?: boolean;
}

export default function GameExpansions({
  expansions,
  compact = false,
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
    <section className={styles.section}>
      <h3>Expansioner</h3>
      <ul className={styles.list}>
        {expansions.map((expansion, index) => (
          <li key={`${expansion}-${index}`}>{expansion}</li>
        ))}
      </ul>
    </section>
  );
}
