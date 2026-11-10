import {
  interactionLabels,
  weightLabels,
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
  const entries = [
    ['Spelare', criteria.players ?? 'Inte angivet'],
    [
      'Svårighetsnivå (minst en)',
      criteria.weightLevels.map((level) => weightLabels[level]).join(', ') ||
        'Spelar ingen roll',
    ],
    [
      'Tillgänglighet',
      criteria.includeUpcoming
        ? 'I samlingen, kommande och okänd tillgänglighet'
        : 'Endast i samlingen',
    ],
    [
      'Speltyp (minst en)',
      criteria.gameTypes.join(', ') || 'Spelar ingen roll',
    ],
    [
      'Interaktion',
      criteria.interactionLevels
        .map((level) => interactionLabels[level])
        .join(', ') || 'Spelar ingen roll',
    ],
    [
      'Spelmekanik (minst en)',
      criteria.mechanics.join(', ') || 'Spelar ingen roll',
    ],
  ];
  const activeEntries = compact
    ? entries.filter(
        ([label]) =>
          (label !== 'Svårighetsnivå (minst en)' ||
            criteria.weightLevels.length > 0) &&
          (label !== 'Speltyp (minst en)' || criteria.gameTypes.length > 0) &&
          (label !== 'Interaktion' || criteria.interactionLevels.length > 0) &&
          (label !== 'Spelmekanik (minst en)' || criteria.mechanics.length > 0),
      )
    : entries;
  return (
    <section
      className={`${styles.summary} ${compact ? styles.compact : ''}`}
      aria-label="Sammanfattning av dina val"
    >
      <h3>Dina val</h3>
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
