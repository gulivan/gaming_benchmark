import { useEffect, useMemo, useState } from 'react';
import type { ArcadeGameProps } from '../types';

const ROWS = 16;
const COLS = 10;

type Board = number[][];

interface ActiveBlock {
  row: number;
  col: number;
}

const createBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => 0));

const randomColumn = (): number => Math.floor(Math.random() * COLS);

const canPlace = (board: Board, row: number, col: number): boolean => {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS && board[row][col] === 0;
};

const clearLines = (board: Board): { board: Board; cleared: number } => {
  const remaining = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = ROWS - remaining.length;

  while (remaining.length < ROWS) {
    remaining.unshift(Array.from({ length: COLS }, () => 0));
  }

  return { board: remaining, cleared };
};

const spawnBlock = (): ActiveBlock => ({ row: 0, col: randomColumn() });

export const TetrisGame = ({ onGameOver }: ArcadeGameProps) => {
  const [board, setBoard] = useState<Board>(createBoard);
  const [active, setActive] = useState<ActiveBlock>(spawnBlock);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('Press start to play.');

  const reset = () => {
    setBoard(createBoard());
    setActive(spawnBlock());
    setScore(0);
    setRunning(true);
    setMessage('Clear lines to gain points.');
  };

  const endGame = (finalScore: number) => {
    setRunning(false);
    setMessage('Board overflow. Game over.');
    onGameOver(finalScore);
  };

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (canPlace(board, active.row + 1, active.col)) {
        setActive((prev) => ({ ...prev, row: prev.row + 1 }));
        return;
      }

      const nextBoard = board.map((row) => [...row]);
      nextBoard[active.row][active.col] = 1;

      const { board: lineClearedBoard, cleared } = clearLines(nextBoard);
      const nextScore = score + cleared * 100;

      if (cleared > 0) {
        setScore(nextScore);
      }

      const nextSpawn = spawnBlock();
      if (!canPlace(lineClearedBoard, nextSpawn.row, nextSpawn.col)) {
        setBoard(lineClearedBoard);
        endGame(nextScore);
        return;
      }

      setBoard(lineClearedBoard);
      setActive(nextSpawn);
    }, 380);

    return () => {
      window.clearTimeout(timer);
    };
  }, [running, board, active, score, onGameOver]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (canPlace(board, active.row, active.col - 1)) {
          setActive((prev) => ({ ...prev, col: prev.col - 1 }));
        }
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (canPlace(board, active.row, active.col + 1)) {
          setActive((prev) => ({ ...prev, col: prev.col + 1 }));
        }
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (canPlace(board, active.row + 1, active.col)) {
          setActive((prev) => ({ ...prev, row: prev.row + 1 }));
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [running, board, active]);

  const renderedBoard = useMemo(() => {
    return board.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (active.row === rowIndex && active.col === colIndex && running) {
          return 2;
        }
        return cell;
      }),
    );
  }, [board, active, running]);

  return (
    <section className="game-block">
      <header className="game-head">
        <p className="game-message">{message}</p>
        <p className="game-score" aria-live="polite">
          Score: {score}
        </p>
      </header>

      <button type="button" className="primary" onClick={reset}>
        {running ? 'Restart' : 'Start'}
      </button>

      <div className="tetris-board" role="grid" aria-label="Tetris board">
        {renderedBoard.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`tetris-cell ${cell === 1 ? 'filled' : ''} ${cell === 2 ? 'active' : ''}`}
              role="gridcell"
            />
          )),
        )}
      </div>
    </section>
  );
};
