import { FormEvent, useMemo, useState } from 'react';
import type { ArcadeGameProps } from '../types';

const WORDS = [
  'PIXEL',
  'QUEST',
  'LEVEL',
  'ARROW',
  'MAGIC',
  'TOKEN',
  'BLADE',
  'RALLY',
  'SCORE',
  'NERDY',
];

type LetterState = 'correct' | 'present' | 'absent';

const pickWord = (): string => WORDS[Math.floor(Math.random() * WORDS.length)];

const getLetterState = (guess: string, target: string, index: number): LetterState => {
  const letter = guess[index];
  if (letter === target[index]) {
    return 'correct';
  }
  if (target.includes(letter)) {
    return 'present';
  }
  return 'absent';
};

const scoreFromAttempt = (attempt: number): number => Math.max(0, (7 - attempt) * 100);

export const WordleGame = ({ onGameOver }: ArcadeGameProps) => {
  const [target, setTarget] = useState(pickWord);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('Start and guess a 5-letter word.');
  const [score, setScore] = useState(0);

  const start = () => {
    setTarget(pickWord());
    setGuesses([]);
    setInput('');
    setRunning(true);
    setMessage('You have 6 attempts.');
    setScore(0);
  };

  const submitGuess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!running) {
      return;
    }

    const guess = input.trim().toUpperCase();

    if (!/^[A-Z]{5}$/.test(guess)) {
      setMessage('Enter exactly five letters.');
      return;
    }

    const nextGuesses = [...guesses, guess];
    setGuesses(nextGuesses);
    setInput('');

    if (guess === target) {
      const attempt = nextGuesses.length;
      const finalScore = scoreFromAttempt(attempt);
      setScore(finalScore);
      setRunning(false);
      setMessage('Solved. Great run.');
      onGameOver(finalScore);
      return;
    }

    if (nextGuesses.length >= 6) {
      setRunning(false);
      setScore(0);
      setMessage(`No attempts left. Word was ${target}.`);
      onGameOver(0);
      return;
    }

    setMessage(`Attempts left: ${6 - nextGuesses.length}.`);
  };

  const rows = useMemo(() => {
    const out: string[] = [...guesses];
    while (out.length < 6) {
      out.push('');
    }
    return out;
  }, [guesses]);

  return (
    <section className="game-block">
      <header className="game-head">
        <p className="game-message">{message}</p>
        <p className="game-score" aria-live="polite">
          Score: {score}
        </p>
      </header>

      <button type="button" className="primary" onClick={start}>
        {running ? 'Restart' : 'Start'}
      </button>

      <form onSubmit={submitGuess} className="wordle-form">
        <label htmlFor="wordle-input">Enter guess</label>
        <div className="wordle-actions">
          <input
            id="wordle-input"
            type="text"
            maxLength={5}
            value={input}
            onChange={(event) => setInput(event.target.value.toUpperCase())}
            disabled={!running}
          />
          <button type="submit" className="secondary" disabled={!running}>
            Submit
          </button>
        </div>
      </form>

      <div className="wordle-grid" role="grid" aria-label="Wordle guesses">
        {rows.flatMap((row, rowIndex) =>
          Array.from({ length: 5 }, (_, colIndex) => {
            const letter = row[colIndex] ?? '';
            const state = row ? getLetterState(row, target, colIndex) : null;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`wordle-cell ${state ?? ''}`}
                role="gridcell"
              >
                {letter}
              </div>
            );
          }),
        )}
      </div>
    </section>
  );
};
