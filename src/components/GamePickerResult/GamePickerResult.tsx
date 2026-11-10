import type { Game } from '../../types/game';
import {
  suggestPickerChanges,
  type PickerCriteria,
} from '../../utils/gamePicker';
import PickerSummary from '../PickerSummary/PickerSummary';
import styles from './GamePickerResult.module.css';

interface GamePickerResultProps {
  games: readonly Game[];
  criteria: PickerCriteria;
  count: number;
  onEdit: (
    trigger: HTMLButtonElement,
    changes?: Partial<PickerCriteria>,
  ) => void;
  onClear: () => void;
}

export default function GamePickerResult({
  games,
  criteria,
  count,
  onEdit,
  onClear,
}: GamePickerResultProps) {
  const suggestions = count === 0 ? suggestPickerChanges(games, criteria) : [];
  return (
    <section className={styles.results} aria-label="Guidens resultat">
      <p className={styles.count} role="status">
        {count} spel matchar dina val. Guidens filter används i stället för
        bibliotekets vanliga filter.
      </p>
      <PickerSummary criteria={criteria} compact />
      <div className={styles.actions}>
        <button
          aria-haspopup="dialog"
          onClick={(event) => onEdit(event.currentTarget)}
        >
          Ändra mina val
        </button>
        <button onClick={onClear}>Rensa guidens filter</button>
      </div>
      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          <p>
            Dessa ändringar skulle ge träffar. Öppna guiden för att granska och
            bekräfta ett förslag:
          </p>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              aria-haspopup="dialog"
              onClick={(event) =>
                onEdit(event.currentTarget, suggestion.changes)
              }
            >
              {suggestion.label} ({suggestion.count} spel)
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
