import { useEffect, useMemo, useState } from 'react';
import type { ArcadeGameProps } from '../types';

const SIZE = 4;

type Grid = number[][];

type Direction = 'left' | 'right' | 'up' | 'down';

interface MoveResult {
  grid: Grid;
  changed: boolean;
  gained: number;
}

const createEmptyGrid = (): Grid =>
  Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));

const cloneGrid = (grid: Grid): Grid => grid.map((row) => [...row]);

const randomTileValue = (): number => (Math.random() < 0.9 ? 2 : 4);

const addRandomTile = (grid: Grid): Grid => {
  const next = cloneGrid(grid);
  const emptyCells: Array<{ row: number; col: number }> = [];

  next.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 0) {
        emptyCells.push({ row: rowIndex, col: colIndex });
      }
    });
  });

  if (emptyCells.length === 0) {
    return next;
  }

  const pick = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  next[pick.row][pick.col] = randomTileValue();
  return next;
};

const initializeGrid = (): Grid => {
  return addRandomTile(addRandomTile(createEmptyGrid()));
};

const slideRowLeft = (row: number[]): { row: number[]; changed: boolean; gained: number } => {
  const compact = row.filter((value) => value !== 0);
  const merged: number[] = [];
  let gained = 0;

  for (let index = 0; index < compact.length; index += 1) {
    const current = compact[index];
    const next = compact[index + 1];

    if (current === next) {
      const mergedValue = current * 2;
      merged.push(mergedValue);
      gained += mergedValue;
      index += 1;
    } else {
      merged.push(current);
    }
  }

  while (merged.length < SIZE) {
    merged.push(0);
  }

  const changed = merged.some((value, idx) => value !== row[idx]);
  return { row: merged, changed, gained };
};

const reverseRows = (grid: Grid): Grid => grid.map((row) => [...row].reverse());

const transpose = (grid: Grid): Grid => {
  const next = createEmptyGrid();
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      next[row][col] = grid[col][row];
    }
  }
  return next;
};

const moveLeft = (grid: Grid): MoveResult => {
  let changed = false;
  let gained = 0;

  const next = grid.map((row) => {
    const result = slideRowLeft(row);
    changed = changed || result.changed;
    gained += result.gained;
    return result.row;
  });

  return { grid: next, changed, gained };
};

const moveGrid = (grid: Grid, direction: Direction): MoveResult => {
  if (direction === 'left') {
    return moveLeft(grid);
  }

  if (direction === 'right') {
    const reversed = reverseRows(grid);
    const moved = moveLeft(reversed);
    return { grid: reverseRows(moved.grid), changed: moved.changed, gained: moved.gained };
  }

  if (direction === 'up') {
    const transposed = transpose(grid);
    const moved = moveLeft(transposed);
    return { grid: transpose(moved.grid), changed: moved.changed, gained: moved.gained };
  }

  const transposed = transpose(grid);
  const moved = moveGrid(transposed, 'right');
  return { grid: transpose(moved.grid), changed: moved.changed, gained: moved.gained };
};

const hasMoves = (grid: Grid): boolean => {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const cell = grid[row][col];
      if (cell === 0) {
        return true;
      }
      if (row + 1 < SIZE && grid[row + 1][col] === cell) {
        return true;
      }
      if (col + 1 < SIZE && grid[row][col + 1] === cell) {
        return true;
      }
    }
  }

  return false;
};

export const Game2048 = ({ onGameOver }: ArcadeGameProps) => {
  const [grid, setGrid] = useState<Grid>(initializeGrid);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('Press start to begin.');

  const start = () => {
    setGrid(initializeGrid());
    setScore(0);
    setRunning(true);
    setMessage('Merge tiles and keep moving.');
  };

  const handleMove = (direction: Direction) => {
    if (!running) {
      return;
    }

    const result = moveGrid(grid, direction);
    if (!result.changed) {
      return;
    }

    const nextGrid = addRandomTile(result.grid);
    const nextScore = score + result.gained;

    setGrid(nextGrid);
    setScore(nextScore);

    if (!hasMoves(nextGrid)) {
      setRunning(false);
      setMessage('No moves left.');
      onGameOver(nextScore);
    }
  };

  useEffect(() => {
    if (!running) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleMove('left');
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleMove('right');
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleMove('up');
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleMove('down');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [running, grid, score]);

  const largestTile = useMemo(() => Math.max(...grid.flat()), [grid]);

  return (
    <section className="game-block">
      <header className="game-head">
        <p className="game-message">{message}</p>
        <p className="game-score" aria-live="polite">
          Score: {score} | Best Tile: {largestTile}
        </p>
      </header>

      <button type="button" className="primary" onClick={start}>
        {running ? 'Restart' : 'Start'}
      </button>

      <div className="move-buttons" aria-label="2048 touch controls">
        <button type="button" className="secondary" onClick={() => handleMove('up')} disabled={!running}>
          Up
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => handleMove('left')}
          disabled={!running}
        >
          Left
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => handleMove('right')}
          disabled={!running}
        >
          Right
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => handleMove('down')}
          disabled={!running}
        >
          Down
        </button>
      </div>

      <div className="grid2048" role="grid" aria-label="2048 board">
        {grid.flatMap((row, rowIndex) =>
          row.map((value, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="tile2048"
              data-value={value > 0 ? value : undefined}
              role="gridcell"
            >
              {value > 0 ? value : ''}
            </div>
          )),
        )}
      </div>
    </section>
  );
};
