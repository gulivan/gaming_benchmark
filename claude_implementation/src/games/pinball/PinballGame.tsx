import { useRef, useEffect, useState } from 'react';
import {
  createInitialState,
  launchBall,
  setFlipperUp,
  update,
  BALL_RADIUS,
} from './pinballPhysics';
import type { PinballState } from './pinballPhysics';
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BUMPERS,
  LEFT_FLIPPER,
  RIGHT_FLIPPER,
} from './pinballLayout';

interface GameProps {
  onGameOver: (score: number) => void;
}

export function PinballGame({ onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<PinballState>(createInitialState());
  const animationIdRef = useRef<number | null>(null);
  const hasCalledGameOverRef = useRef(false);
  const [gameOverFlag, setGameOverFlag] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === ' ') {
        e.preventDefault();
        if (!stateRef.current.launched) {
          stateRef.current = launchBall(stateRef.current);
        }
      }

      if (key === 'arrowleft' || key === 'a') {
        e.preventDefault();
        stateRef.current = setFlipperUp(stateRef.current, 'left', true);
      }

      if (key === 'arrowright' || key === 'd') {
        e.preventDefault();
        stateRef.current = setFlipperUp(stateRef.current, 'right', true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') {
        e.preventDefault();
        stateRef.current = setFlipperUp(stateRef.current, 'left', false);
      }

      if (key === 'arrowright' || key === 'd') {
        e.preventDefault();
        stateRef.current = setFlipperUp(stateRef.current, 'right', false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      stateRef.current = update(stateRef.current);

      if (stateRef.current.gameOver && !hasCalledGameOverRef.current) {
        hasCalledGameOverRef.current = true;
        setGameOverFlag(true);
      }

      ctx.fillStyle = '#1a1a3e';
      ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      for (const bumper of BUMPERS) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      const leftAngle =
        LEFT_FLIPPER.angle + (stateRef.current.leftFlipperUp ? -60 : 0);
      const leftRadians = (leftAngle * Math.PI) / 180;
      const leftEndX = LEFT_FLIPPER.x + LEFT_FLIPPER.length * Math.cos(leftRadians);
      const leftEndY = LEFT_FLIPPER.y + LEFT_FLIPPER.length * Math.sin(leftRadians);

      ctx.strokeStyle = stateRef.current.leftFlipperUp ? '#4ade80' : '#fbbf24';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(LEFT_FLIPPER.x, LEFT_FLIPPER.y);
      ctx.lineTo(leftEndX, leftEndY);
      ctx.stroke();

      const rightAngle =
        RIGHT_FLIPPER.angle + (stateRef.current.rightFlipperUp ? 60 : 0);
      const rightRadians = (rightAngle * Math.PI) / 180;
      const rightEndX = RIGHT_FLIPPER.x + RIGHT_FLIPPER.length * Math.cos(rightRadians);
      const rightEndY = RIGHT_FLIPPER.y + RIGHT_FLIPPER.length * Math.sin(rightRadians);

      ctx.strokeStyle = stateRef.current.rightFlipperUp ? '#4ade80' : '#fbbf24';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(RIGHT_FLIPPER.x, RIGHT_FLIPPER.y);
      ctx.lineTo(rightEndX, rightEndY);
      ctx.stroke();

      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.arc(
        stateRef.current.ball.x,
        stateRef.current.ball.y,
        BALL_RADIUS,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(
        stateRef.current.ball.x,
        stateRef.current.ball.y,
        BALL_RADIUS,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${stateRef.current.score}`, 10, 30);

      if (!stateRef.current.launched) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press Space to launch', TABLE_WIDTH / 2, TABLE_HEIGHT / 2);
      }

      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameOverFlag) {
      onGameOver(stateRef.current.score);
    }
  }, [gameOverFlag, onGameOver]);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="rounded-lg shadow-2xl overflow-hidden border-4 border-gray-700">
        <canvas
          ref={canvasRef}
          width={TABLE_WIDTH}
          height={TABLE_HEIGHT}
          className="block"
        />
      </div>
    </div>
  );
}
