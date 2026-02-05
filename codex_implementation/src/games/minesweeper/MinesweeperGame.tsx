import { useMemo, useState } from 'react';
import type { ArcadeGameProps } from '../types';

const SIZE = 8;
const MINES = 10;
const SAFE_CELLS = SIZE * SIZE - MINES;

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
}

type Board = Cell[][];

const createBlankBoard = (): Board =>
  Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  );

const neighbors = (row: number, col: number): Array<{ row: number; col: number }> => {
  const out: Array<{ row: number; col: number }> = [];

  for (let r = row - 1; r <= row + 1; r += 1) {
    for (let c = col - 1; c <= col + 1; c += 1) {
      if (r === row && c === col) {
        continue;
      }

      if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
        out.push({ row: r, col: c });
      }
    }
  }

  return out;
};

const generateBoard = (): Board => {
  const board = createBlankBoard();
  let placed = 0;

  while (placed < MINES) {
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);
    if (board[row][col].mine) {
      continue;
    }

    board[row][col].mine = true;
    placed += 1;
  }

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col].mine) {
        continue;
      }

      board[row][col].adjacent = neighbors(row, col).filter(
        ({ row: nRow, col: nCol }) => board[nRow][nCol].mine,
      ).length;
    }
  }

  return board;
};

const cloneBoard = (board: Board): Board => board.map((row) => row.map((cell) => ({ ...cell })));

const revealConnected = (board: Board, row: number, col: number): Board => {
  const next = cloneBoard(board);
  const queue: Array<{ row: number; col: number }> = [{ row, col }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    const cell = next[current.row][current.col];
    if (cell.revealed || cell.flagged) {
      continue;
    }

    cell.revealed = true;

    if (cell.adjacent !== 0 || cell.mine) {
      continue;
    }

    for (const neighbor of neighbors(current.row, current.col)) {
      const candidate = next[neighbor.row][neighbor.col];
      if (!candidate.revealed && !candidate.flagged) {
        queue.push(neighbor);
      }
    }
  }

  return next;
};

const countRevealedSafe = (board: Board): number => {
  let count = 0;
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const cell = board[row][col];
      if (cell.revealed && !cell.mine) {
        count += 1;
      }
    }
  }
  return count;
};

export const MinesweeperGame = ({ onGameOver }: ArcadeGameProps) => {
  const [board, setBoard] = useState<Board>(generateBoard);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('Start and clear the safe cells.');
  const [score, setScore] = useState(0);

  const start = () => {
    setBoard(generateBoard());
    setRunning(true);
    setMessage('Avoid mines. Right-click to flag.');
    setScore(0);
  };

  const revealCell = (row: number, col: number) => {
    if (!running) {
      return;
    }

    const target = board[row][col];
    if (target.revealed || target.flagged) {
      return;
    }

    if (target.mine) {
      const exploded = board.map((line) =>
        line.map((cell) => ({ ...cell, revealed: cell.mine ? true : cell.revealed })),
      );
      const finalScore = score;
      setBoard(exploded);
      setRunning(false);
      setMessage('Boom. You hit a mine.');
      onGameOver(finalScore);
      return;
    }

    const revealedBoard = revealConnected(board, row, col);
    const revealedSafe = countRevealedSafe(revealedBoard);
    const nextScore = revealedSafe * 10;

    setBoard(revealedBoard);
    setScore(nextScore);

    if (revealedSafe >= SAFE_CELLS) {
      const winScore = nextScore + 500;
      setScore(winScore);
      setRunning(false);
      setMessage('Board cleared. You win.');
      onGameOver(winScore);
    }
  };

  const toggleFlag = (row: number, col: number) => {
    if (!running) {
      return;
    }

    setBoard((prev) => {
      const next = cloneBoard(prev);
      const cell = next[row][col];
      if (cell.revealed) {
        return prev;
      }
      cell.flagged = !cell.flagged;
      return next;
    });
  };

  const minesLeft = useMemo(() => {
    const flaggedCount = board.flat().filter((cell) => cell.flagged).length;
    return Math.max(0, MINES - flaggedCount);
  }, [board]);

  return (
    <section className="game-block">
      <header className="game-head">
        <p className="game-message">{message}</p>
        <p className="game-score" aria-live="polite">
          Score: {score} | Mines left: {minesLeft}
        </p>
      </header>

      <button type="button" className="primary" onClick={start}>
        {running ? 'Restart' : 'Start'}
      </button>

      <div className="mine-grid" role="grid" aria-label="Minesweeper board">
        {board.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let text = '';
            if (cell.flagged) {
              text = '🚩';
            } else if (!cell.revealed) {
              text = '';
            } else if (cell.mine) {
              text = '💣';
            } else if (cell.adjacent > 0) {
              text = String(cell.adjacent);
            }

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                className={`mine-cell ${cell.revealed ? 'revealed' : ''}`}
                onClick={() => revealCell(rowIndex, colIndex)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  toggleFlag(rowIndex, colIndex);
                }}
                disabled={!running && !cell.revealed}
                aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
              >
                {text}
              </button>
            );
          }),
        )}
      </div>
    </section>
  );
};
