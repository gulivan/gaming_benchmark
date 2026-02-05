import { useEffect, useRef, useState } from 'react';
import {
  ROWS,
  COLS,
  MINES,
  createBoard,
  revealCell,
  toggleFlag,
  checkWin,
  countRevealed,
  revealAll,
} from './minesweeperLogic';
import type { Board } from './minesweeperLogic';

type GameStatus = 'playing' | 'won' | 'lost';

type GameProps = {
  onGameOver: (score: number) => void;
};

const numberColors: Record<number, string> = {
  1: 'text-blue-500',
  2: 'text-green-500',
  3: 'text-red-500',
  4: 'text-purple-500',
  5: 'text-orange-500',
  6: 'text-teal-500',
  7: 'text-black',
  8: 'text-gray-500',
};

export function MinesweeperGame({ onGameOver }: GameProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const hasCalledGameOver = useRef(false);

  // Handle left click (reveal cell)
  const handleCellClick = (row: number, col: number) => {
    if (!board) {
      const newBoard = createBoard(ROWS, COLS, MINES, row, col);
      const revealedBoard = revealCell(newBoard, row, col);
      setBoard(revealedBoard);
      if (checkWin(revealedBoard)) {
        setGameStatus('won');
      }
      return;
    }

    if (gameStatus !== 'playing' || board[row][col].flagged) {
      return;
    }

    if (board[row][col].mine) {
      const revealedBoard = revealAll(board);
      setBoard(revealedBoard);
      setGameStatus('lost');
      return;
    }

    const newBoard = revealCell(board, row, col);
    setBoard(newBoard);

    if (checkWin(newBoard)) {
      setGameStatus('won');
    }
  };

  // Handle right click (toggle flag)
  const handleContextMenu = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();

    if (!board || gameStatus !== 'playing' || board[row][col].revealed) {
      return;
    }

    const newBoard = toggleFlag(board, row, col);
    setBoard(newBoard);
  };

  // Call onGameOver when game ends
  useEffect(() => {
    if (gameStatus !== 'playing' && board && !hasCalledGameOver.current) {
      hasCalledGameOver.current = true;
      const score = countRevealed(board);
      onGameOver(score);
    }
  }, [gameStatus, board, onGameOver]);

  // Calculate remaining mines
  const flagCount = board
    ? board.flat().filter((cell) => cell.flagged).length
    : 0;
  const minesRemaining = MINES - flagCount;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-lg font-semibold">
        Mines Remaining: <span className="text-red-600">{minesRemaining}</span>
      </div>

      <div className="grid gap-1 bg-gray-700 p-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {board
          ? board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleContextMenu(e, r, c)}
                  className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded transition-colors ${
                    cell.flagged
                      ? 'bg-gray-600'
                      : cell.revealed
                        ? cell.mine
                          ? 'bg-red-600'
                          : 'bg-gray-800'
                        : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {cell.flagged && '🚩'}
                  {cell.revealed && cell.mine && '💣'}
                  {cell.revealed && !cell.mine && cell.adjacentMines > 0 && (
                    <span className={numberColors[cell.adjacentMines]}>
                      {cell.adjacentMines}
                    </span>
                  )}
                </button>
              ))
            )
          : Array.from({ length: ROWS * COLS }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleCellClick(Math.floor(i / COLS), i % COLS)}
                className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 transition-colors"
              />
            ))}
      </div>

      {gameStatus === 'won' && (
        <div className="text-2xl font-bold text-green-600">You Won!</div>
      )}
      {gameStatus === 'lost' && (
        <div className="text-2xl font-bold text-red-600">Game Over!</div>
      )}
    </div>
  );
}
