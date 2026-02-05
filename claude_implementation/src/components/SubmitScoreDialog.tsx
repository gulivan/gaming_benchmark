import { useRef, useEffect, useState } from 'react';

interface Props {
  score: number;
  open: boolean;
  onSubmit: (playerName: string) => void;
}

export function SubmitScoreDialog({ score, open, onSubmit }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dialogRef.current?.close();
    onSubmit(name);
    setName('');
  }

  return (
    <dialog
      ref={dialogRef}
      className="bg-gray-800 text-white rounded-2xl p-8 max-w-sm w-full backdrop:bg-black/60"
    >
      <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
      <p className="text-gray-300 mb-6">
        Your score: <span className="text-purple-300 font-mono font-bold">{score.toLocaleString()}</span>
      </p>
      <form onSubmit={handleSubmit}>
        <label className="block text-sm text-gray-400 mb-1">Enter your name</label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anonymous"
          maxLength={20}
          className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-500 mb-4 outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
        >
          Submit Score
        </button>
      </form>
    </dialog>
  );
}
