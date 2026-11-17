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
  const inputId = useId();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState('');
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
        if (!request.signal.aborted)
          setError('AI-chatten är inte tillgänglig just nu.');
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
    setError('');
    setSuggestions([]);
    try {
      const response = await requestPicker(
        unlocked
          ? {
              action: 'chat',
              messages: [...turns.slice(-8), userTurn],
            }
          : { action: 'unlock', password: content },
        request.signal,
      );
      if (request.signal.aborted) return;
      if (response.status === 401) {
        setUnlocked(false);
        setError(
          unlocked
            ? 'Din session har gått ut. Lås upp chatten igen.'
            : 'Fel lösenord.',
        );
        return;
      }
      if (response.status === 429) {
        setError(
          'AI-chatten har nått en användningsgräns. Försök igen senare eller välj manuellt.',
        );
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
      if (!request.signal.aborted)
        setError(
          'AI-chatten kunde inte svara. Försök igen eller välj manuellt.',
        );
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
    <section className={styles.chat} aria-label="AI-chatt">
      <h3>Vad vill ni spela?</h3>
      <p className={styles.intro}>
        Berätta om sällskapet och spelkvällen så hittar vi något i Spelhyllan.
      </p>
      {unlocked && (
        <div className={styles.transcript} role="log" aria-label="Konversation">
          {turns.map((turn, index) => (
            <div key={index} className={styles.turn} data-role={turn.role}>
              <strong>{turn.role === 'user' ? 'Du' : 'Spelhyllan'}</strong>
              <p>{turn.content}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={submit} className={styles.form} aria-busy={pending}>
        <label htmlFor={inputId}>
          {unlocked ? 'Ditt meddelande' : 'Lösenord för AI-chatten'}
        </label>
        <div className={styles.composer}>
          {unlocked ? (
            <textarea
              id={inputId}
              value={message}
              maxLength={600}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Vi är fyra och vill spela något taktiskt …"
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
            {pending ? 'Vänta …' : unlocked ? 'Skicka' : 'Lås upp'}
          </button>
        </div>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </form>
      {unlocked && (
        <div className={styles.suggestions} aria-label="Svarsförslag">
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
