import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import styles from './GamePickerChat.module.css';

type Turn = {
  role: 'user' | 'assistant';
  content: string;
  titles?: string[];
};

function requestPicker(body: object, signal: AbortSignal) {
  return fetch('/api/game-picker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
}

export default function GamePickerChat() {
  const inputId = useId();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    const request = new AbortController();
    controller.current = request;
    async function checkSession() {
      try {
        const response = await requestPicker(
          { action: 'status' },
          request.signal,
        );
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!request.signal.aborted) setUnlocked(data.unlocked === true);
      } catch {
        if (!request.signal.aborted)
          setError('AI-chatten är inte tillgänglig just nu.');
      } finally {
        if (!request.signal.aborted) setPending(false);
      }
    }
    void checkSession();
    return () => controller.current?.abort();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = unlocked ? message.trim() : password;
    if (!content || pending) return;
    const request = new AbortController();
    controller.current = request;
    const userTurn: Turn = { role: 'user', content };
    setPending(true);
    setError('');

    try {
      const response = await requestPicker(
        unlocked
          ? {
              action: 'chat',
              messages: [...turns.slice(-8), userTurn].map(
                ({ role, content }) => ({ role, content }),
              ),
            }
          : { action: 'unlock', password: content },
        request.signal,
      );
      if (request.signal.aborted) return;
      if (response.status === 401) {
        setError(
          unlocked
            ? 'Din session har gått ut. Lås upp chatten igen.'
            : 'Fel lösenord.',
        );
        setUnlocked(false);
        return;
      }
      if (response.status === 429) {
        setError('För många försök. Vänta en minut och försök igen.');
        return;
      }
      if (!response.ok) throw new Error();

      if (unlocked) {
        const { reply, titles } = await response.json();
        if (request.signal.aborted) return;
        setTurns([
          ...turns,
          userTurn,
          { role: 'assistant', content: reply, titles },
        ]);
        setMessage('');
      } else {
        setUnlocked(true);
      }
    } catch {
      if (!request.signal.aborted)
        setError(
          'AI-chatten kunde inte svara. Försök igen eller välj manuellt.',
        );
    } finally {
      if (!request.signal.aborted) {
        setPending(false);
        if (!unlocked) setPassword('');
      }
    }
  };

  return (
    <section className={styles.chat} aria-label="AI-chatt">
      <p>Berätta vad ni är sugna på så föreslår jag spel ur din samling.</p>
      {unlocked && (
        <div className={styles.transcript} role="log" aria-label="Konversation">
          {turns.map((turn, index) => (
            <div key={index} className={styles.turn} data-role={turn.role}>
              <strong>{turn.role === 'user' ? 'Du' : 'Spelhyllan'}</strong>
              <p>{turn.content}</p>
              {!!turn.titles?.length && (
                <ul>
                  {turn.titles.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
      <form onSubmit={submit} className={styles.form} aria-busy={pending}>
        <label htmlFor={inputId}>
          {unlocked ? 'Ditt meddelande' : 'Lösenord för AI-chatten'}
        </label>
        {unlocked ? (
          <textarea
            id={inputId}
            value={message}
            maxLength={600}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Vi är fyra och vill spela något taktiskt på max en timme."
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
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        )}
        <button
          type="submit"
          disabled={pending || !(unlocked ? message.trim() : password)}
        >
          {pending ? 'Vänta …' : unlocked ? 'Skicka' : 'Lås upp'}
        </button>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
