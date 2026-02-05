import { useRef, useEffect, useState } from 'react';
import {
  createInitialState,
  flap,
  update,
  BIRD_SIZE,
  BIRD_X,
  PIPE_WIDTH,
} from './flappyBirdLogic';
import type { GameState } from './flappyBirdLogic';

interface GameProps {
  onGameOver: (score: number) => void;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

export function FlappyBirdGame({ onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(
    createInitialState(CANVAS_WIDTH, CANVAS_HEIGHT)
  );
  const animationFrameRef = useRef<number | null>(null);
  const hasCalledGameOverRef = useRef(false);
  const [gameOverFlag, setGameOverFlag] = useState(false);

  // Handle flap input
  const handleFlap = () => {
    stateRef.current = flap(stateRef.current);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Canvas click handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = () => {
      handleFlap();
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // Update game state
      stateRef.current = update(stateRef.current);

      // Check if game just ended
      if (stateRef.current.gameOver && !hasCalledGameOverRef.current) {
        hasCalledGameOverRef.current = true;
        setGameOverFlag(true);
      }

      // Render
      render(ctx, stateRef.current, canvas.width, canvas.height);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Call onGameOver when game ends
  useEffect(() => {
    if (gameOverFlag && hasCalledGameOverRef.current) {
      onGameOver(stateRef.current.score);
    }
  }, [gameOverFlag, onGameOver]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer bg-blue-200"
      />
    </div>
  );
}

/**
 * Render the game to canvas
 */
function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number
) {
  // Clear canvas with sky blue background
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, width, height);

  // Draw ground
  ctx.fillStyle = '#228B22';
  ctx.fillRect(0, height - 20, width, 20);

  // Draw pipes
  ctx.fillStyle = '#228B22';
  ctx.strokeStyle = '#1a6b1a';
  ctx.lineWidth = 2;

  state.pipes.forEach((pipe) => {
    // Top pipe
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
    ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

    // Bottom pipe
    const bottomPipeTop = pipe.topHeight + 150;
    ctx.fillRect(pipe.x, bottomPipeTop, PIPE_WIDTH, height - bottomPipeTop);
    ctx.strokeRect(pipe.x, bottomPipeTop, PIPE_WIDTH, height - bottomPipeTop);
  });

  // Draw bird (yellow circle)
  ctx.fillStyle = '#FFD700';
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(
    BIRD_X + BIRD_SIZE / 2,
    state.bird.y + BIRD_SIZE / 2,
    BIRD_SIZE / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();

  // Draw score
  ctx.fillStyle = 'white';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(state.score.toString(), width / 2, 20);

  // Draw start message
  if (!state.started) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Click or press Space to start', width / 2, height / 2);
  }

  // Draw game over overlay
  if (state.gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over', width / 2, height / 2 - 40);

    ctx.font = 'bold 32px Arial';
    ctx.fillText(`Final Score: ${state.score}`, width / 2, height / 2 + 30);

    ctx.font = '20px Arial';
    ctx.fillText('Reload to play again', width / 2, height / 2 + 80);
  }
}
