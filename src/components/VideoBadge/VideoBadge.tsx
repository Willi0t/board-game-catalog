import styles from './VideoBadge.module.css';

export default function VideoBadge() {
  return (
    <span className={styles.overlay} aria-hidden="true">
      <span className={styles.play}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M8 4v16l12-8z" />
        </svg>
      </span>
      <span className={styles.label}>Video</span>
    </span>
  );
}
