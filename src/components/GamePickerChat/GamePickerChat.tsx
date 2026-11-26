import type { Message } from '../../i18n/translations';
import { useLanguage } from '../../i18n/LanguageContext';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import styles from './GamePickerChat.module.css';

type Turn = { role: 'user' | 'assistant'; content: string };
function requestPicker(body: object, signal: AbortSignal) {
  return fetch('/api/game-picker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
}
export default function GamePickerChat({
  onRecommend,
}: {
  onRecommend: (ids: string[]) => void;
}) {
  const { t, language } = useLanguage();
  const inputId = useId();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<Message | null>(null);
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);
  useEffect(() => {
    const request = new AbortController();
    controller.current = request;
    void requestPicker({ action: 'status' }, request.signal)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!request.signal.aborted) setUnlocked(data.unlocked === true);
      })
      .catch(() => {
        if (!request.signal.aborted) setError('chatUnavailable');
      })
      .finally(() => {
        if (!request.signal.aborted) setPending(false);
      });
    return () => controller.current?.abort();
  }, []);
  const send = async (answer?: string) => {
    const content = unlocked ? (answer ?? message).trim() : password;
    if (!content || pending || busy.current) return;
    busy.current = true;
    const request = new AbortController();
    controller.current = request;
    const userTurn: Turn = { role: 'user', content };
    setPending(true);
    setError(null);
    setSuggestions([]);
    try {
      const response = await requestPicker(
        unlocked
          ? {
              action: 'chat',
              language,
              messages: [...turns.slice(-8), userTurn],
            }
          : { action: 'unlock', password: content },
        request.signal,
      );
      if (request.signal.aborted) return;
      if (response.status === 401) {
        setUnlocked(false);
        setError(unlocked ? 'sessionExpired' : 'wrongPassword');
        return;
      }
      if (response.status === 429) {
        setError('chatLimit');
        return;
      }
      if (!response.ok) throw new Error();
      if (unlocked) {
        const data = await response.json();
        if (
          typeof data.reply !== 'string' ||
          !Array.isArray(data.gameIds) ||
          !Array.isArray(data.suggestions)
        )
          throw new Error();
        if (request.signal.aborted) return;
        setTurns([
          ...turns,
          userTurn,
          { role: 'assistant', content: data.reply },
        ]);
        setMessage('');
        setSuggestions(
          data.suggestions.filter(
            (s: unknown): s is string => typeof s === 'string',
          ),
        );
        if (data.gameIds.length)
          onRecommend(
            data.gameIds.filter(
              (id: unknown): id is string => typeof id === 'string',
            ),
          );
      } else {
        setUnlocked(true);
        setPassword('');
      }
    } catch {
      if (!request.signal.aborted) setError('chatFailed');
    } finally {
      busy.current = false;
      if (!request.signal.aborted) setPending(false);
    }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send();
  };
  return (
    <section className={styles.chat} aria-label={t('chat')}>
      <h3>{t('chatHeading')}</h3>
      <p className={styles.intro}>{t('chatIntro')}</p>
      {unlocked && (
        <div
          className={styles.transcript}
          role="log"
          aria-label={t('conversation')}
        >
          {turns.map((turn, index) => (
            <div key={index} className={styles.turn} data-role={turn.role}>
              <strong>{turn.role === 'user' ? t('you') : 'Spelhyllan'}</strong>
              <p>{turn.content}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={submit} className={styles.form} aria-busy={pending}>
        <label htmlFor={inputId}>
          {unlocked ? t('yourMessage') : t('chatPassword')}
        </label>
        <div className={styles.composer}>
          {unlocked ? (
            <textarea
              id={inputId}
              value={message}
              maxLength={600}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('chatPlaceholder')}
              rows={3}
              required
            />
          ) : (
            <input
              id={inputId}
              type="password"
              autoComplete="current-password"
              value={password}
              maxLength={128}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
          <button
            type="submit"
            disabled={pending || !(unlocked ? message.trim() : password)}
          >
            {pending ? t('pleaseWait') : unlocked ? t('send') : t('unlock')}
          </button>
        </div>
        {error && (
          <p role="alert" className={styles.error}>
            {t(error)}
          </p>
        )}
      </form>
      {unlocked && (
        <div className={styles.suggestions} aria-label={t('suggestedReplies')}>
          {suggestions.map((answer) => (
            <button
              key={answer}
              disabled={pending}
              onClick={() => void send(answer)}
            >
              {answer}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
