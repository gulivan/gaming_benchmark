import { useEffect, useRef, useState } from 'react';
import {
  initBoard,
  addRandomTile,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
  hasMovesLeft,
  boardsEqual,
} from './game2048Logic';
import type { Board } from './game2048Logic';

interface GameProps {
  onGameOver: (score: number) => void;
}

const TILE_COLORS: Record<number, string> = {
  2: 'bg-amber-100',
  4: 'bg-amber-200',
  8: 'bg-orange-300',
  16: 'bg-orange-400',
  32: 'bg-orange-500',
  64: 'bg-red-400',
  128: 'bg-yellow-300',
  256: 'bg-yellow-400',
  512: 'bg-yellow-500',
  1024: 'bg-green-400',
  2048: 'bg-purple-500',
};

function getTileColor(value: number): string {
  return TILE_COLORS[value] || 'bg-purple-600';
}

export function Game2048({ onGameOver }: GameProps) {
  const [board, setBoard] = useState<Board>(initBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const hasCalledGameOver = useRef(false);

  // Call onGameOver callback when game ends
  useEffect(() => {
    if (gameOver && !hasCalledGameOver.current) {
      hasCalledGameOver.current = true;
      onGameOver(score);
    }
  }, [gameOver, score, onGameOver]);

  // Handle arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      let result: { board: Board; score: number } | null = null;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        result = moveLeft(board);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        result = moveRight(board);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        result = moveUp(board);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        result = moveDown(board);
      }

      if (result && !boardsEqual(result.board, board)) {
        const newBoard = addRandomTile(result.board);
        setBoard(newBoard);
        setScore((prev) => prev + result.score);

        // Check if game is over
        if (!hasMovesLeft(newBoard)) {
          setGameOver(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-white mb-8">2048</h1>

      <div className="mb-6 text-center">
        <p className="text-xl text-gray-400 mb-2">Score</p>
        <p className="text-4xl font-bold text-white">{score}</p>
      </div>

      <div className="bg-gray-700 rounded-lg p-4 mb-8" style={{ width: '320px', height: '320px' }}>
        <div className="grid grid-cols-4 gap-2 h-full">
          {board.map((row, i) =>
            row.map((value, j) => (
              <div
                key={`${i}-${j}`}
                className={`rounded-lg flex items-center justify-center font-bold text-2xl transition-colors duration-200 ${
                  value === 0 ? 'bg-gray-600' : getTileColor(value)
                } ${value > 256 ? 'text-white' : 'text-gray-900'}`}
              >
                {value > 0 ? value : ''}
              </div>
            )),
          )}
        </div>
      </div>

      {gameOver && (
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400 mb-4">Game Over!</p>
          <p className="text-lg text-gray-300">Final Score: {score}</p>
        </div>
      )}

      <p className="text-gray-400 text-sm mt-8">Use arrow keys to play</p>
    </div>
  );
}
