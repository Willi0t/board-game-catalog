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
  const dialogRef = useModalDialog({ openerRef, fallbackRef });
  const titleId = useId();
  const countId = useId();
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
      ref={dialogRef}
      className={styles.dialog}
      aria-modal="true"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
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
          <p
            id={countId}
            className={styles.count}
            aria-live="polite"
            aria-atomic="true"
          >
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
                <fieldset className={styles.fieldset}>
                  <legend>Hur avancerat får det vara?</legend>
                  <p>
                    Välj en eller flera nivåer. Inga val betyder ”Spelar ingen
                    roll”. Okänd svårighet matchar bara utan svårighetsfilter.
                  </p>
                  <div className={styles.radios}>
                    <label>
                      <input
                        type="checkbox"
                        checked={!criteria.weightLevels.length}
                        disabled={
                          criteria.weightLevels.length > 0 &&
                          counts.weightLevels.any === 0
                        }
                        onChange={() => update({ weightLevels: [] })}
                      />
                      Spelar ingen roll
                      <OptionCount
                        count={counts.weightLevels.any}
                        selected={!criteria.weightLevels.length}
                      />
                    </label>
                    {weightOptions.map((level) => (
                      <label
                        key={level}
                        data-empty={counts.weightLevels[level] === 0}
                      >
                        <input
                          type="checkbox"
                          checked={criteria.weightLevels.includes(level)}
                          disabled={
                            !criteria.weightLevels.includes(level) &&
                            counts.weightLevels[level] === 0
                          }
                          aria-invalid={
                            criteria.weightLevels.includes(level) &&
                            counts.weightLevels[level] === 0
                              ? true
                              : undefined
                          }
                          onChange={() =>
                            update({
                              weightLevels: criteria.weightLevels.includes(
                                level,
                              )
                                ? criteria.weightLevels.filter(
                                    (selected) => selected !== level,
                                  )
                                : [...criteria.weightLevels, level],
                            })
                          }
                        />
                        {weightLabels[level]}
                        <OptionCount
                          count={counts.weightLevels[level]}
                          selected={criteria.weightLevels.includes(level)}
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
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
                <fieldset className={styles.fieldset}>
                  <legend>Hur mycket spelarinteraktion vill ni ha?</legend>
                  <p>
                    Interaktion räknar både samarbete och konkurrens och är vår
                    subjektiva bedömning. Välj flera nivåer för att matcha minst
                    en. Inga val betyder ”Spelar ingen roll”.
                  </p>
                  <div className={styles.radios}>
                    <label data-empty={counts.interaction.any === 0}>
                      <input
                        type="checkbox"
                        checked={criteria.interactionLevels.length === 0}
                        disabled={
                          criteria.interactionLevels.length > 0 &&
                          counts.interaction.any === 0
                        }
                        onChange={() => update({ interactionLevels: [] })}
                      />
                      Spelar ingen roll
                      <OptionCount
                        count={counts.interaction.any}
                        selected={criteria.interactionLevels.length === 0}
                      />
                    </label>
                    {interactionOptions.map((interaction) => (
                      <label
                        key={interaction}
                        data-empty={counts.interaction[interaction] === 0}
                      >
                        <input
                          type="checkbox"
                          checked={criteria.interactionLevels.includes(
                            interaction,
                          )}
                          disabled={
                            !criteria.interactionLevels.includes(interaction) &&
                            counts.interaction[interaction] === 0
                          }
                          aria-invalid={
                            criteria.interactionLevels.includes(interaction) &&
                            counts.interaction[interaction] === 0
                              ? true
                              : undefined
                          }
                          onChange={() =>
                            update({
                              interactionLevels:
                                criteria.interactionLevels.includes(interaction)
                                  ? criteria.interactionLevels.filter(
                                      (level) => level !== interaction,
                                    )
                                  : [
                                      ...criteria.interactionLevels,
                                      interaction,
                                    ],
                            })
                          }
                        />
                        {interactionLabels[interaction]}
                        <OptionCount
                          count={counts.interaction[interaction]}
                          selected={criteria.interactionLevels.includes(
                            interaction,
                          )}
                        />
                      </label>
                    ))}
                  </div>
                  {criteria.interactionLevels.length > 0 && (
                    <button
                      className={styles.clear}
                      type="button"
                      onClick={() => update({ interactionLevels: [] })}
                    >
                      Rensa interaktionsval
                    </button>
                  )}
                </fieldset>
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
