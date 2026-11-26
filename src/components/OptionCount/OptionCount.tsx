import { useLanguage } from '../../i18n/LanguageContext';
import styles from './OptionCount.module.css';

export default function OptionCount({
  count,
  selected = false,
}: {
  count: number;
  selected?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <span className={`${styles.badge} ${count === 0 ? styles.empty : ''}`}>
      {t(count === 0 && selected ? 'noMatch' : 'gameCount', count)}
    </span>
  );
}
