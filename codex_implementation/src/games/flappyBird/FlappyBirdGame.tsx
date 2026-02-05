import { useEffect, useState } from 'react';
import type { ArcadeGameProps } from '../types';

const WIDTH = 340;
const HEIGHT = 420;
const BIRD_X = 70;
const BIRD_SIZE = 24;
const PIPE_WIDTH = 48;
const GAP_HEIGHT = 140;
const PIPE_SPEED = 4;
const GRAVITY = 0.52;

interface FlappyState {
  birdY: number;
  velocity: number;
  pipeX: number;
  gapY: number;
  score: number;
  running: boolean;
}

const randomGapY = () => 70 + Math.floor(Math.random() * 180);

const initialState = (): FlappyState => ({
  birdY: HEIGHT / 2,
  velocity: 0,
  pipeX: WIDTH + 30,
  gapY: randomGapY(),
  score: 0,
  running: false,
});

export const FlappyBirdGame = ({ onGameOver }: ArcadeGameProps) => {
  const [game, setGame] = useState<FlappyState>(initialState);
  const [message, setMessage] = useState('Tap start and flap to survive.');

  const start = () => {
    setGame({ ...initialState(), running: true });
    setMessage('Fly through each pipe gap.');
  };

  const flap = () => {
    setGame((prev) => {
      if (!prev.running) {
        return prev;
      }
      return { ...prev, velocity: -7.2 };
    });
  };

  useEffect(() => {
    if (!game.running) {
      return;
    }

    const timer = window.setInterval(() => {
      let gameOverScore: number | null = null;

      setGame((prev) => {
        if (!prev.running) {
          return prev;
        }

        let velocity = prev.velocity + GRAVITY;
        let birdY = prev.birdY + velocity;
        let pipeX = prev.pipeX - PIPE_SPEED;
        let gapY = prev.gapY;
        let score = prev.score;
        let running: boolean = prev.running;

        if (pipeX + PIPE_WIDTH < 0) {
          pipeX = WIDTH + 20;
          gapY = randomGapY();
          score += 1;
        }

        const birdTop = birdY;
        const birdBottom = birdY + BIRD_SIZE;
        const collidesPipeX = BIRD_X + BIRD_SIZE > pipeX && BIRD_X < pipeX + PIPE_WIDTH;
        const collidesPipe = collidesPipeX && (birdTop < gapY || birdBottom > gapY + GAP_HEIGHT);
        const collidesBounds = birdTop <= 0 || birdBottom >= HEIGHT;

        if (collidesPipe || collidesBounds) {
          running = false;
          gameOverScore = score;
          velocity = 0;
          birdY = Math.max(0, Math.min(HEIGHT - BIRD_SIZE, birdY));
        }

        return { birdY, velocity, pipeX, gapY, score, running };
      });

      if (gameOverScore !== null) {
        setMessage('Game over.');
        onGameOver(gameOverScore);
      }
    }, 28);

    return () => {
      window.clearInterval(timer);
    };
  }, [game.running, onGameOver]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        flap();
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
        <button type="button" className="secondary" onClick={flap} disabled={!game.running}>
          Flap
        </button>
      </div>

      <div
        className="flappy-stage"
        role="application"
        aria-label="Flappy Bird play area"
        onClick={flap}
      >
        <div className="flappy-bird" style={{ left: BIRD_X, top: game.birdY }} />
        <div className="flappy-pipe" style={{ left: game.pipeX, top: 0, height: game.gapY }} />
        <div
          className="flappy-pipe"
          style={{
            left: game.pipeX,
            top: game.gapY + GAP_HEIGHT,
            height: HEIGHT - (game.gapY + GAP_HEIGHT),
          }}
        />
      </div>
    </section>
  );
};
