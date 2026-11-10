import styles from './OptionCount.module.css';

export default function OptionCount({
  count,
  selected = false,
}: {
  count: number;
  selected?: boolean;
}) {
  return (
    <span className={`${styles.badge} ${count === 0 ? styles.empty : ''}`}>
      {count} spel{count === 0 && selected ? ' – matchar inte' : ''}
    </span>
  );
}
