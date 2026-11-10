import { useId } from 'react';
import OptionCount from '../OptionCount/OptionCount';
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
          <label key={option} data-empty={counts[option] === 0}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              disabled={!selected.includes(option) && counts[option] === 0}
              aria-invalid={
                selected.includes(option) && counts[option] === 0
                  ? true
                  : undefined
              }
              onChange={() =>
                onChange(
                  selected.includes(option)
                    ? selected.filter((tag) => tag !== option)
                    : [...selected, option],
                )
              }
            />
            <span>{option}</span>
            <OptionCount
              count={counts[option] ?? 0}
              selected={selected.includes(option)}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
