import {
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
  type FormEvent,
} from 'react';
import type { Game } from '../../types/game';
import {
  gameTypeOptions,
  mechanicOptions,
} from '../../constants/catalogOptions';
import useModalDialog from '../../hooks/useModalDialog';
import {
  interactionLabels,
  countPickerOptions,
  findPickerConflicts,
  weightOptions,
  interactionOptions,
  pickerPlayerOptions,
  weightLabels,
  type PickerCriteria,
} from '../../utils/gamePicker';
import PickerChoices from '../PickerChoices/PickerChoices';
import PickerLevelChoices from '../PickerLevelChoices/PickerLevelChoices';
import PickerSummary from '../PickerSummary/PickerSummary';
import Icon from '../Icon/Icon';
import OptionCount from '../OptionCount/OptionCount';
import styles from './GamePicker.module.css';

interface GamePickerProps {
  games: readonly Game[];
  onClose: () => void;
  criteria: PickerCriteria;
  onCriteriaChange: (criteria: PickerCriteria) => void;
  onApply: () => void;
  openerRef: RefObject<HTMLElement | null>;
  fallbackRef: RefObject<HTMLElement | null>;
}

const steps = ['Sällskap', 'Spelkänsla', 'Önskemål'];

export default function GamePicker({
  games,
  onClose,
  criteria,
  onCriteriaChange,
  onApply,
  openerRef,
  fallbackRef,
}: GamePickerProps) {
  const dialogProps = useModalDialog({ onClose, openerRef, fallbackRef });
  const titleId = useId();
  const errorId = useId();
  const [step, setStep] = useState(0);
  const [playerError, setPlayerError] = useState(false);
  const playerOptionsRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const counts = countPickerOptions(games, criteria);
  const conflicts = findPickerConflicts(criteria, counts);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    contentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  const update = (changes: Partial<PickerCriteria>) => {
    onCriteriaChange({ ...criteria, ...changes });
    if (changes.players !== undefined) {
      setPlayerError(false);
    }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (criteria.players == null) {
      setPlayerError(true);
      const target =
        playerOptionsRef.current?.querySelector<HTMLButtonElement>(
          'button:not(:disabled)',
        ) ?? playerOptionsRef.current;
      target?.focus();
      return;
    }
    if (step < 2) setStep((previous) => previous + 1);
    else onApply();
  };

  return (
    <dialog
      {...dialogProps}
      className={styles.dialog}
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id={titleId}>Välj åt mig</h2>
          <button onClick={onClose} aria-label="Stäng spelväljaren">
            <Icon name="close" />
          </button>
        </header>
        <div ref={contentRef} className={styles.content}>
          <p className={styles.intro}>
            Hitta ett spel för just ert sällskap. Guiden använder hela katalogen
            och visar alla träffar i biblioteket. Dina vanliga biblioteksfilter
            pausas medan guidens resultat visas.
          </p>
          <ol className={styles.steps} aria-label="Guidens steg">
            {steps.map((label, index) => (
              <li
                key={label}
                aria-current={step === index ? 'step' : undefined}
              >
                <span>{index + 1}</span>
                {label}
              </li>
            ))}
          </ol>
          <h3 ref={headingRef} tabIndex={-1} className={styles.heading}>
            {steps[step]}
          </h3>
          <p className={styles.count} aria-live="polite" aria-atomic="true">
            {criteria.players == null
              ? 'Ange spelarantal för att se hur många spel som matchar.'
              : `${counts.total} spel matchar`}
          </p>
          {conflicts.length > 0 && (
            <section className={styles.conflicts} aria-label="Val att se över">
              <h4>
                {counts.total === 0
                  ? 'Inga spel matchar dina val'
                  : 'Vissa val matchar inte längre'}
              </h4>
              <p>
                Se över valen nedan. De har 0 spel efter tidigare val och
                behålls tills du själv ändrar eller avmarkerar dem.
              </p>
              <ul>
                {conflicts.map((conflict) => (
                  <li key={conflict.label}>
                    <button
                      type="button"
                      onClick={() => setStep(conflict.step)}
                    >
                      Se över {conflict.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <form noValidate onSubmit={submit}>
            {step === 0 && (
              <>
                <fieldset className={styles.fieldset}>
                  <legend>Hur många ska spela?</legend>
                  <p>
                    Obligatoriskt. Spelet måste stödja exakt ert antal spelare.
                  </p>
                  <div
                    ref={playerOptionsRef}
                    tabIndex={-1}
                    role="group"
                    className={styles.quick}
                    aria-label="Snabbval för spelarantal"
                    aria-describedby={playerError ? errorId : undefined}
                  >
                    {pickerPlayerOptions.map((count) => (
                      <button
                        key={count}
                        type="button"
                        aria-pressed={criteria.players === count}
                        data-empty={counts.players[count] === 0}
                        disabled={
                          criteria.players !== count &&
                          counts.players[count] === 0
                        }
                        onClick={() =>
                          update({
                            players: criteria.players === count ? null : count,
                          })
                        }
                      >
                        {criteria.players === count && (
                          <span aria-hidden="true">✓ </span>
                        )}
                        {count} spelare
                        <OptionCount
                          count={counts.players[count] ?? 0}
                          selected={criteria.players === count}
                        />
                      </button>
                    ))}
                  </div>
                  {playerError && (
                    <p id={errorId} role="alert" className={styles.error}>
                      Välj hur många som ska spela med snabbvalen.
                    </p>
                  )}
                </fieldset>
                <PickerLevelChoices
                  legend="Hur avancerat får det vara?"
                  description="Välj en eller flera nivåer. Inga val betyder ”Spelar ingen roll”. Okänd svårighet matchar bara utan svårighetsfilter."
                  options={weightOptions}
                  labels={weightLabels}
                  selected={criteria.weightLevels}
                  counts={counts.weightLevels}
                  onChange={(weightLevels) => update({ weightLevels })}
                />
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={criteria.includeUpcoming}
                    onChange={(event) =>
                      update({ includeUpcoming: event.target.checked })
                    }
                  />
                  Inkludera kommande spel
                </label>
                <p className={styles.help}>
                  När rutan är markerad tillåts även spel med okänd
                  tillgänglighet. Annars visas endast spel som är kända att
                  finnas i samlingen.
                </p>
              </>
            )}
            {step === 1 && (
              <>
                <PickerChoices
                  legend="Vilken speltyp är ni sugna på?"
                  options={gameTypeOptions}
                  selected={criteria.gameTypes}
                  counts={counts.gameTypes}
                  onChange={(gameTypes) => update({ gameTypes })}
                />
                <PickerLevelChoices
                  legend="Hur mycket spelarinteraktion vill ni ha?"
                  description="Interaktion räknar både samarbete och konkurrens och är vår subjektiva bedömning. Välj flera nivåer för att matcha minst en. Inga val betyder ”Spelar ingen roll”."
                  options={interactionOptions}
                  labels={interactionLabels}
                  selected={criteria.interactionLevels}
                  counts={counts.interaction}
                  onChange={(interactionLevels) =>
                    update({ interactionLevels })
                  }
                  clearLabel="Rensa interaktionsval"
                />
              </>
            )}
            {step === 2 && (
              <>
                <PickerChoices
                  legend="Vilka spelmekaniker gillar ni?"
                  options={mechanicOptions}
                  selected={criteria.mechanics}
                  counts={counts.mechanics}
                  onChange={(mechanics) => update({ mechanics })}
                />
                <PickerSummary criteria={criteria} />
              </>
            )}
            <footer className={styles.navigation}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((previous) => previous - 1)}
                >
                  Bakåt
                </button>
              )}
              <button className={styles.primary} type="submit">
                {step === 2 ? `Visa ${counts.total} spel` : 'Nästa'}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </dialog>
  );
}
