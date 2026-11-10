import { useId } from 'react';
import PickerOption from '../PickerOption/PickerOption';
import { togglePickerChoice } from '../../utils/gamePicker';
import styles from './PickerLevelChoices.module.css';

interface PickerLevelChoicesProps<Level extends string> {
  legend: string;
  description: string;
  options: readonly Level[];
  labels: Readonly<Record<Level, string>>;
  selected: readonly Level[];
  counts: Readonly<Record<Level | 'any', number>>;
  onChange: (selected: Level[]) => void;
  clearLabel?: string;
}

export default function PickerLevelChoices<Level extends string>({
  legend,
  description,
  options,
  labels,
  selected,
  counts,
  onChange,
  clearLabel,
}: PickerLevelChoicesProps<Level>) {
  const helpId = useId();
  return (
    <fieldset className={styles.group} aria-describedby={helpId}>
      <legend>{legend}</legend>
      <p id={helpId}>{description}</p>
      <div className={styles.choices}>
        <PickerOption
          label="Spelar ingen roll"
          count={counts.any}
          checked={selected.length === 0}
          onChange={() => onChange([])}
        />
        {options.map((level) => (
          <PickerOption
            key={level}
            label={labels[level]}
            count={counts[level]}
            checked={selected.includes(level)}
            onChange={() => onChange(togglePickerChoice(selected, level))}
          />
        ))}
      </div>
      {clearLabel && selected.length > 0 && (
        <button
          className={styles.clear}
          type="button"
          onClick={() => onChange([])}
        >
          {clearLabel}
        </button>
      )}
    </fieldset>
  );
}
