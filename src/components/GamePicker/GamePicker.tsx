import { useLanguage } from '../../i18n/LanguageContext';
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
  getInteractionLabels,
  countPickerOptions,
  findPickerConflicts,
  weightOptions,
  interactionOptions,
  pickerPlayerOptions,
  getWeightLabels,
  type PickerCriteria,
} from '../../utils/gamePicker';
import GamePickerChat from '../GamePickerChat/GamePickerChat';
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
  onRecommend: (ids: string[]) => void;
  openerRef: RefObject<HTMLElement | null>;
  fallbackRef: RefObject<HTMLElement | null>;
}

export default function GamePicker({
  games,
  onClose,
  criteria,
  onCriteriaChange,
  onApply,
  onRecommend,
  openerRef,
  fallbackRef,
}: GamePickerProps) {
  const { t, tagLabel } = useLanguage();
  const steps = [t('group'), t('playStyle'), t('preferences')];
  const dialogProps = useModalDialog({ onClose, openerRef, fallbackRef });
  const titleId = useId();
  const errorId = useId();
  const descriptionId = useId();
  const [mode, setMode] = useState<'ai' | 'manual' | null>(null);
  const manual = mode === 'manual';
  const [step, setStep] = useState(0);
  const [playerError, setPlayerError] = useState(false);
  const playerOptionsRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const counts = countPickerOptions(games, criteria);
  const conflicts = findPickerConflicts(criteria, counts, { t, tagLabel });

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    contentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [mode, step]);

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
      className={`${styles.dialog} ${mode === null ? styles.compact : ''} ${manual ? styles.manual : ''}`}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={mode === null ? descriptionId : undefined}
    >
      {mode === null ? (
        <div className={styles.welcome}>
          <div className={styles.banner}>
            <img src="/images/ui/game-picker-banner.webp" alt="" />
            <button
              type="button"
              onClick={onClose}
              aria-label={t('closePicker')}
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className={styles.welcomeBody}>
            <h2 id={titleId}>{t('pickForMe')}</h2>
            <p id={descriptionId}>{t('pickerIntro')}</p>
            <ul className={styles.features}>
              <li>
                <span aria-hidden="true">✓</span>
                {t('aiFeature')}
              </li>
              <li>
                <span aria-hidden="true">✓</span>
                {t('manualFeature')}
              </li>
              <li>
                <span aria-hidden="true">✓</span>
                {t('catalogFeature')}
              </li>
            </ul>
            <div className={styles.welcomeActions}>
              <button type="button" onClick={() => setMode('manual')}>
                {t('manual')}
              </button>
              <button type="button" onClick={() => setMode('ai')}>
                AI
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.panel}>
          <header className={styles.header}>
            <h2
              id={titleId}
              ref={mode === 'ai' ? headingRef : undefined}
              tabIndex={mode === 'ai' ? -1 : undefined}
            >
              {t('pickForMe')}
            </h2>
            <button onClick={onClose} aria-label={t('closePicker')}>
              <Icon name="close" />
            </button>
          </header>
          <div ref={contentRef} className={styles.content}>
            <div className={styles.mode}>
              <button
                type="button"
                aria-pressed={mode === 'ai'}
                onClick={() => setMode('ai')}
              >
                AI
              </button>
              <button
                type="button"
                aria-pressed={manual}
                onClick={() => setMode('manual')}
              >
                {t('manual')}
              </button>
            </div>
            {mode === 'ai' && <GamePickerChat onRecommend={onRecommend} />}
            {manual && (
              <>
                <p className={styles.intro}>{t('guideIntro')}</p>
                <ol className={styles.steps} aria-label={t('guideSteps')}>
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
                  className={styles.count}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {criteria.players == null
                    ? t('enterPlayers')
                    : t('matchCount', counts.total)}
                </p>
                {conflicts.length > 0 && (
                  <section
                    className={styles.conflicts}
                    aria-label={t('reviewChoices')}
                  >
                    <h4>
                      {counts.total === 0
                        ? t('noGuideMatches')
                        : t('conflictingChoices')}
                    </h4>
                    <p>{t('conflictHelp')}</p>
                    <ul>
                      {conflicts.map((conflict) => (
                        <li key={conflict.label}>
                          <button
                            type="button"
                            onClick={() => setStep(conflict.step)}
                          >
                            {t('reviewChoice', conflict.label)}
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
                        <legend>{t('playerQuestion')}</legend>
                        <p>{t('requiredPlayers')}</p>
                        <div
                          ref={playerOptionsRef}
                          tabIndex={-1}
                          role="group"
                          className={styles.quick}
                          aria-label={t('quickPlayers')}
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
                                  players:
                                    criteria.players === count ? null : count,
                                })
                              }
                            >
                              {criteria.players === count && (
                                <span aria-hidden="true">✓ </span>
                              )}
                              {t('playerCount', count)}
                              <OptionCount
                                count={counts.players[count] ?? 0}
                                selected={criteria.players === count}
                              />
                            </button>
                          ))}
                        </div>
                        {playerError && (
                          <p id={errorId} role="alert" className={styles.error}>
                            {t('playerError')}
                          </p>
                        )}
                      </fieldset>
                      <PickerLevelChoices
                        legend={t('difficultyQuestion')}
                        description={t('weightHelp')}
                        options={weightOptions}
                        labels={getWeightLabels(t)}
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
                        {t('includeUpcoming')}
                      </label>
                      <p className={styles.help}>{t('upcomingHelp')}</p>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <PickerChoices
                        legend={t('typeQuestion')}
                        options={gameTypeOptions}
                        selected={criteria.gameTypes}
                        counts={counts.gameTypes}
                        onChange={(gameTypes) => update({ gameTypes })}
                      />
                      <PickerLevelChoices
                        legend={t('interactionQuestion')}
                        description={t('interactionHelp')}
                        options={interactionOptions}
                        labels={getInteractionLabels(t)}
                        selected={criteria.interactionLevels}
                        counts={counts.interaction}
                        onChange={(interactionLevels) =>
                          update({ interactionLevels })
                        }
                        clearLabel={t('clearInteraction')}
                      />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <PickerChoices
                        legend={t('mechanicQuestion')}
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
                        {t('back')}
                      </button>
                    )}
                    <button className={styles.primary} type="submit">
                      {step === 2 ? t('showGames', counts.total) : t('next')}
                    </button>
                  </footer>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
