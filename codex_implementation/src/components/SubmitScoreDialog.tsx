import { useEffect, useMemo, useRef, useState } from 'react';

interface SubmitScoreDialogProps {
  open: boolean;
  gameTitle: string;
  initialScore: number;
  onSave: (score: number) => void;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const SubmitScoreDialog = ({
  open,
  gameTitle,
  initialScore,
  onSave,
  onClose,
}: SubmitScoreDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(() => String(initialScore));
  const [error, setError] = useState('');

  const title = useMemo(() => `${gameTitle} - Game Over`, [gameTitle]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValue(String(initialScore));
    setError('');

    const previousActive = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const container = dialogRef.current;
      if (!container) {
        return;
      }

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled'));

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousActive?.focus();
    };
  }, [open, initialScore, onClose]);

  if (!open) {
    return null;
  }

  const submit = () => {
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric < 0) {
      setError('Score must be a non-negative integer.');
      return;
    }

    onSave(numeric);
  };

  return (
    <div className="dialog-overlay" role="presentation">
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-score-title"
        ref={dialogRef}
      >
        <h2 id="submit-score-title">{title}</h2>
        <p>Enter your score to save it on this game&apos;s leaderboard.</p>

        <label htmlFor="score-input">Score</label>
        <input
          id="score-input"
          ref={inputRef}
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'score-error' : undefined}
        />
        {error ? (
          <p className="dialog-error" id="score-error">
            {error}
          </p>
        ) : null}

        <div className="dialog-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={submit}>
            Save Score
          </button>
        </div>
      </div>
    </div>
  );
};
