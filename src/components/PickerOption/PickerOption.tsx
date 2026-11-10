import OptionCount from '../OptionCount/OptionCount';
import styles from './PickerOption.module.css';

interface PickerOptionProps {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}

export default function PickerOption({
  label,
  count,
  checked,
  onChange,
}: PickerOptionProps) {
  return (
    <label data-empty={count === 0}>
      <input
        className={styles.input}
        type="checkbox"
        checked={checked}
        disabled={!checked && count === 0}
        aria-invalid={checked && count === 0 ? true : undefined}
        onChange={onChange}
      />
      <span>{label}</span>
      <OptionCount count={count} selected={checked} />
    </label>
  );
}
