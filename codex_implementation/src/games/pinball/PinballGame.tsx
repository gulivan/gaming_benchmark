import { useEffect, useState } from 'react';
import type { ArcadeGameProps } from '../types';

const WIDTH = 340;
const HEIGHT = 440;
const BALL_SIZE = 14;
const PADDLE_WIDTH = 84;
const PADDLE_HEIGHT = 12;
const PADDLE_Y = HEIGHT - 34;
const GRAVITY = 0.16;

const BUMPERS = [
  { x: 74, y: 102, r: 20 },
  { x: 170, y: 82, r: 22 },
  { x: 264, y: 126, r: 20 },
  { x: 118, y: 202, r: 18 },
  { x: 234, y: 220, r: 18 },
] as const;

interface PinballState {
  ballX: number;
  ballY: number;
  vx: number;
  vy: number;
  paddleX: number;
  score: number;
  running: boolean;
  hitCooldown: number;
}

const baseState = (): PinballState => ({
  ballX: WIDTH / 2 - BALL_SIZE / 2,
  ballY: 42,
  vx: Math.random() > 0.5 ? 2.6 : -2.6,
  vy: 2,
  paddleX: WIDTH / 2 - PADDLE_WIDTH / 2,
  score: 0,
  running: false,
  hitCooldown: 0,
});

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const PinballGame = ({ onGameOver }: ArcadeGameProps) => {
  const [game, setGame] = useState<PinballState>(baseState);
  const [message, setMessage] = useState('Start and keep the ball in play.');

  const start = () => {
    setGame({ ...baseState(), running: true });
    setMessage('Hit bumpers for points.');
  };

  const movePaddle = (delta: number) => {
    setGame((prev) => ({
      ...prev,
      paddleX: clamp(prev.paddleX + delta, 0, WIDTH - PADDLE_WIDTH),
    }));
  };

  useEffect(() => {
    if (!game.running) {
      return;
    }

    const timer = window.setInterval(() => {
      let finalScore: number | null = null;

      setGame((prev) => {
        if (!prev.running) {
          return prev;
        }

        let ballX = prev.ballX + prev.vx;
        let ballY = prev.ballY + prev.vy;
        let vx = prev.vx;
        let vy = prev.vy + GRAVITY;
        const paddleX = prev.paddleX;
        let score = prev.score;
        const hitCooldown = Math.max(0, prev.hitCooldown - 1);
        let nextCooldown = hitCooldown;
        let running = true;

        if (ballX <= 0) {
          ballX = 0;
          vx = Math.abs(vx);
        }

        if (ballX + BALL_SIZE >= WIDTH) {
          ballX = WIDTH - BALL_SIZE;
          vx = -Math.abs(vx);
        }

        if (ballY <= 0) {
          ballY = 0;
          vy = Math.abs(vy);
        }

        const paddleCollision =
          ballY + BALL_SIZE >= PADDLE_Y &&
          ballY + BALL_SIZE <= PADDLE_Y + PADDLE_HEIGHT + 8 &&
          ballX + BALL_SIZE >= paddleX &&
          ballX <= paddleX + PADDLE_WIDTH &&
          vy > 0;

        if (paddleCollision) {
          ballY = PADDLE_Y - BALL_SIZE;
          const paddleCenter = paddleX + PADDLE_WIDTH / 2;
          const ballCenter = ballX + BALL_SIZE / 2;
          const offset = (ballCenter - paddleCenter) / (PADDLE_WIDTH / 2);
          vx = clamp(vx + offset * 1.2, -6, 6);
          vy = -Math.abs(vy) * 0.93;
          score += 10;
        }

        const ballCenterX = ballX + BALL_SIZE / 2;
        const ballCenterY = ballY + BALL_SIZE / 2;

        if (nextCooldown === 0) {
          for (const bumper of BUMPERS) {
            const dx = ballCenterX - bumper.x;
            const dy = ballCenterY - bumper.y;
            const distance = Math.hypot(dx, dy);
            const minDistance = bumper.r + BALL_SIZE / 2;

            if (distance < minDistance) {
              const nx = distance === 0 ? 1 : dx / distance;
              const ny = distance === 0 ? -1 : dy / distance;
              const speed = Math.hypot(vx, vy) + 0.6;
              vx = nx * speed;
              vy = ny * speed;
              score += 25;
              nextCooldown = 6;
              break;
            }
          }
        }

        if (ballY > HEIGHT) {
          running = false;
          finalScore = score;
        }

        return {
          ballX,
          ballY,
          vx,
          vy,
          paddleX,
          score,
          running,
          hitCooldown: nextCooldown,
        };
      });

      if (finalScore !== null) {
        setMessage('Ball drained. Game over.');
        onGameOver(finalScore);
      }
    }, 16);

    return () => {
      window.clearInterval(timer);
    };
  }, [game.running, onGameOver]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        movePaddle(-24);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        movePaddle(24);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <section className="game-block">
      <header className="game-head">
        <p className="game-message">{message}</p>
        <p className="game-score" aria-live="polite">
          Score: {game.score}
        </p>
      </header>

      <div className="button-row">
        <button type="button" className="primary" onClick={start}>
          {game.running ? 'Restart' : 'Start'}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => movePaddle(-24)}
          disabled={!game.running}
        >
          Left
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => movePaddle(24)}
          disabled={!game.running}
        >
          Right
        </button>
      </div>

      <div className="pinball-stage" role="application" aria-label="Pinball play area">
        {BUMPERS.map((bumper) => (
          <div
            key={`${bumper.x}-${bumper.y}`}
            className="pinball-bumper"
            style={{
              left: bumper.x - bumper.r,
              top: bumper.y - bumper.r,
              width: bumper.r * 2,
              height: bumper.r * 2,
            }}
          />
        ))}
        <div
          className="pinball-ball"
          style={{ left: game.ballX, top: game.ballY, width: BALL_SIZE, height: BALL_SIZE }}
        />
        <div
          className="pinball-paddle"
          style={{
            left: game.paddleX,
            top: PADDLE_Y,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
          }}
        />
      </div>
    </section>
  );
};
