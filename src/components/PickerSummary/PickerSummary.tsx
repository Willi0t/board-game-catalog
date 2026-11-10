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
  const entries: [string, string | number, boolean][] = [
    ['Spelare', criteria.players ?? 'Inte angivet', true],
    [
      'Svårighetsnivå (minst en)',
      criteria.weightLevels.map((level) => weightLabels[level]).join(', ') ||
        'Spelar ingen roll',
      criteria.weightLevels.length > 0,
    ],
    [
      'Tillgänglighet',
      criteria.includeUpcoming
        ? 'I samlingen, kommande och okänd tillgänglighet'
        : 'Endast i samlingen',
      true,
    ],
    [
      'Speltyp (minst en)',
      criteria.gameTypes.join(', ') || 'Spelar ingen roll',
      criteria.gameTypes.length > 0,
    ],
    [
      'Interaktion',
      criteria.interactionLevels
        .map((level) => interactionLabels[level])
        .join(', ') || 'Spelar ingen roll',
      criteria.interactionLevels.length > 0,
    ],
    [
      'Spelmekanik (minst en)',
      criteria.mechanics.join(', ') || 'Spelar ingen roll',
      criteria.mechanics.length > 0,
    ],
  ];
  const activeEntries = entries.filter(([, , active]) => !compact || active);
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
