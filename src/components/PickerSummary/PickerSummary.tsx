import { useLanguage } from '../../i18n/LanguageContext';
import {
  getInteractionLabels,
  getWeightLabels,
  type PickerCriteria,
} from '../../utils/gamePicker';
import styles from './PickerSummary.module.css';

export default function PickerSummary({
  criteria,
  compact = false,
}: {
  criteria: PickerCriteria;
  compact?: boolean;
}) {
  const { t, tagLabel } = useLanguage();
  const weightLabels = getWeightLabels(t);
  const interactionLabels = getInteractionLabels(t);
  const entries: [string, string | number, boolean][] = [
    [t('players'), criteria.players ?? t('unspecified'), true],
    [
      t('difficultyAny'),
      criteria.weightLevels.map((level) => weightLabels[level]).join(', ') ||
        t('any'),
      criteria.weightLevels.length > 0,
    ],
    [
      t('availability'),
      criteria.includeUpcoming ? t('allAvailability') : t('ownedOnly'),
      true,
    ],
    [
      t('typeAny'),
      criteria.gameTypes.map(tagLabel).join(', ') || t('any'),
      criteria.gameTypes.length > 0,
    ],
    [
      t('interaction'),
      criteria.interactionLevels
        .map((level) => interactionLabels[level])
        .join(', ') || t('any'),
      criteria.interactionLevels.length > 0,
    ],
    [
      t('mechanicAny'),
      criteria.mechanics.map(tagLabel).join(', ') || t('any'),
      criteria.mechanics.length > 0,
    ],
  ];
  const activeEntries = entries.filter(([, , active]) => !compact || active);
  return (
    <section
      className={`${styles.summary} ${compact ? styles.compact : ''}`}
      aria-label={t('choiceSummary')}
    >
      <h3>{t('yourChoices')}</h3>
      <dl>
        {activeEntries.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
