import { useId } from 'react';
import PickerOption from '../PickerOption/PickerOption';
import { togglePickerChoice } from '../../utils/gamePicker';
import styles from './PickerChoices.module.css';

interface PickerChoicesProps {
  legend: string;
  options: readonly string[];
  selected: readonly string[];
  counts: Readonly<Record<string, number>>;
  onChange: (selected: string[]) => void;
}

export default function PickerChoices({
  legend,
  options,
  selected,
  counts,
  onChange,
}: PickerChoicesProps) {
  const helpId = useId();
  return (
    <fieldset className={styles.group} aria-describedby={helpId}>
      <legend>{legend}</legend>
      <p id={helpId}>
        Valfritt. Inga val betyder ”Spelar ingen roll”. Välj flera för att
        matcha minst ett.
      </p>
      <div className={styles.choices}>
        {options.map((option) => (
          <PickerOption
            key={option}
            label={option}
            checked={selected.includes(option)}
            count={counts[option] ?? 0}
            onChange={() => onChange(togglePickerChoice(selected, option))}
          />
        ))}
      </div>
    </fieldset>
  );
}
