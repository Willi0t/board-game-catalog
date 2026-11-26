import { useLanguage } from '../../i18n/LanguageContext';
import getTagColor from '../../utils/getTagColor';
import type { CatalogTagCount } from '../../utils/getTagCounts';
import styles from './TagNavigation.module.css';

interface TagNavigationProps {
  title: string;
  options: readonly CatalogTagCount[];
  selected: string;
  onChange: (value: string) => void;
}

export default function TagNavigation({
  title,
  options,
  selected,
  onChange,
}: TagNavigationProps) {
  const { t, tagLabel } = useLanguage();
  return (
    <section className={styles.group}>
      <h2>{title}</h2>
      <nav aria-label={title}>
        {options.map(({ tag, count }) => (
          <button
            key={tag}
            className={`${styles.button} ${selected === tag ? styles.active : ''}`}
            aria-label={t('labeledCount', tagLabel(tag), count)}
            aria-pressed={selected === tag}
            onClick={() => onChange(selected === tag ? '' : tag)}
          >
            <span
              className={styles.dot}
              style={{ backgroundColor: getTagColor(tag) }}
              aria-hidden="true"
            />
            <span className={styles.label}>{tagLabel(tag)}</span>
            {selected === tag && (
              <span className={styles.check} aria-hidden="true">
                ✓
              </span>
            )}
            <span className={styles.count}>{count}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
