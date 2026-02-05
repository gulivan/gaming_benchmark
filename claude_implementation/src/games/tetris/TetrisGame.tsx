import { useRef, useState, useEffect, useCallback } from 'react';
import {
  ROWS,
  COLS,
  CELL_SIZE,
  createInitialState,
  moveDown,
  moveLeft,
  moveRight,
  rotate,
  hardDrop,
  type GameState,
} from './tetrisLogic';

export type GameProps = {
  onGameOver: (score: number) => void;
};

export function TetrisGame({ onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(createInitialState());
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLines, setDisplayLines] = useState(0);
  const hasCalledGameOverRef = useRef(false);
  const [gameOverFlag, setGameOverFlag] = useState(false);
  const dropIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const renderFrameRef = useRef<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameStateRef.current.gameOver) return;

    switch (e.key) {
      case 'ArrowLeft':
        gameStateRef.current = moveLeft(gameStateRef.current);
        e.preventDefault();
        break;
      case 'ArrowRight':
        gameStateRef.current = moveRight(gameStateRef.current);
        e.preventDefault();
        break;
      case 'ArrowUp':
        gameStateRef.current = rotate(gameStateRef.current);
        e.preventDefault();
        break;
      case 'ArrowDown':
        gameStateRef.current = moveDown(gameStateRef.current);
        e.preventDefault();
        break;
      case ' ':
        gameStateRef.current = hardDrop(gameStateRef.current);
        e.preventDefault();
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(COLS * CELL_SIZE, r * CELL_SIZE);
      ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_SIZE, 0);
      ctx.lineTo(c * CELL_SIZE, ROWS * CELL_SIZE);
      ctx.stroke();
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (state.board[r][c] !== null) {
          ctx.fillStyle = state.board[r][c]!;
          ctx.fillRect(
            c * CELL_SIZE + 1,
            r * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
          );
        }
      }
    }

    ctx.globalAlpha = 0.7;
    const { shape, color, row: shapeRow, col: shapeCol } = state.current;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          ctx.fillStyle = color;
          ctx.fillRect(
            (shapeCol + c) * CELL_SIZE + 1,
            (shapeRow + r) * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
          );
        }
      }
    }
    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    const gameLoop = () => {
      renderGame();
      renderFrameRef.current = requestAnimationFrame(gameLoop);
    };

    renderFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (renderFrameRef.current !== null) {
        cancelAnimationFrame(renderFrameRef.current);
      }
    };
  }, [renderGame]);

  useEffect(() => {
    const dropInterval = setInterval(() => {
      if (!gameStateRef.current.gameOver) {
        gameStateRef.current = moveDown(gameStateRef.current);
        setDisplayScore(gameStateRef.current.score);
        setDisplayLines(gameStateRef.current.linesCleared);
      }
      if (gameStateRef.current.gameOver && !hasCalledGameOverRef.current) {
        hasCalledGameOverRef.current = true;
        setGameOverFlag(true);
      }
    }, 500);

    dropIntervalRef.current = dropInterval;

    return () => {
      clearInterval(dropInterval);
    };
  }, []);

  useEffect(() => {
    if (gameOverFlag) {
      onGameOver(gameStateRef.current.score);
    }
  }, [gameOverFlag, onGameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">
          Tetris
        </h1>
        <canvas
          ref={canvasRef}
          width={COLS * CELL_SIZE}
          height={ROWS * CELL_SIZE}
          className="border-4 border-gray-600 block mb-4"
        />
        <div className="flex justify-between text-white text-lg mb-4">
          <div>
            <span className="font-semibold">Score:</span> {displayScore}
          </div>
          <div>
            <span className="font-semibold">Lines:</span> {displayLines}
          </div>
        </div>
        {gameStateRef.current.gameOver && (
          <div className="bg-red-600 text-white text-center py-2 px-4 rounded font-bold">
            Game Over!
          </div>
        )}
      </div>
    </div>
  );
}
