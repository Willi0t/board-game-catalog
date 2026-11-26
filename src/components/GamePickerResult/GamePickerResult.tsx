import { useLanguage } from '../../i18n/LanguageContext';
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
  const { t } = useLanguage();
  const suggestions =
    count === 0 ? suggestPickerChanges(games, criteria, t) : [];
  return (
    <section className={styles.results} aria-label={t('guideResults')}>
      <p className={styles.count} role="status">
        {t('guideResultNote', count)}
      </p>
      <PickerSummary criteria={criteria} compact />
      <div className={styles.actions}>
        <button
          aria-haspopup="dialog"
          onClick={(event) => onEdit(event.currentTarget)}
        >
          {t('editChoices')}
        </button>
        <button onClick={onClear}>{t('clearGuide')}</button>
      </div>
      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          <p>{t('suggestionIntro')}</p>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              aria-haspopup="dialog"
              onClick={(event) =>
                onEdit(event.currentTarget, suggestion.changes)
              }
            >
              {t('labeledCount', suggestion.label, suggestion.count)}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
