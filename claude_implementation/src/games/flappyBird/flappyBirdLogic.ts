// Game constants
export const GRAVITY = 0.5;
export const FLAP_VELOCITY = -8;
export const PIPE_WIDTH = 60;
export const PIPE_GAP = 150;
export const PIPE_SPEED = 3;
export const BIRD_SIZE = 30;
export const BIRD_X = 80;
const PIPE_SPAWN_DISTANCE = 200;
const MIN_PIPE_HEIGHT = 40;

// Types
export interface Bird {
  y: number;
  velocity: number;
}

export interface Pipe {
  x: number;
  topHeight: number;
  scored: boolean;
}

export interface GameState {
  bird: Bird;
  pipes: Pipe[];
  score: number;
  gameOver: boolean;
  started: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Creates initial game state with bird centered vertically
 */
export function createInitialState(
  canvasWidth: number,
  canvasHeight: number
): GameState {
  return {
    bird: {
      y: canvasHeight / 2 - BIRD_SIZE / 2,
      velocity: 0,
    },
    pipes: [],
    score: 0,
    gameOver: false,
    started: false,
    canvasWidth,
    canvasHeight,
  };
}

/**
 * Apply flap action - sets bird velocity and marks game as started
 */
export function flap(state: GameState): GameState {
  return {
    ...state,
    bird: {
      ...state.bird,
      velocity: FLAP_VELOCITY,
    },
    started: true,
  };
}

/**
 * Main game update loop
 */
export function update(state: GameState): GameState {
  // Don't update if game hasn't started or is over
  if (!state.started || state.gameOver) {
    return state;
  }

  let newState = { ...state };

  // Apply gravity to bird
  newState.bird = {
    ...newState.bird,
    velocity: newState.bird.velocity + GRAVITY,
    y: newState.bird.y + newState.bird.velocity,
  };

  // Move pipes left and remove off-screen ones
  newState.pipes = newState.pipes
    .map((pipe) => ({
      ...pipe,
      x: pipe.x - PIPE_SPEED,
    }))
    .filter((pipe) => pipe.x + PIPE_WIDTH > 0);

  // Spawn new pipe if needed
  if (
    newState.pipes.length === 0 ||
    newState.pipes[newState.pipes.length - 1].x <
      newState.canvasWidth - PIPE_SPAWN_DISTANCE
  ) {
    const topHeight = Math.random() * (newState.canvasHeight - PIPE_GAP - MIN_PIPE_HEIGHT * 2) + MIN_PIPE_HEIGHT;
    newState.pipes.push({
      x: newState.canvasWidth,
      topHeight,
      scored: false,
    });
  }

  // Score when bird passes the right edge of a pipe
  newState.pipes.forEach((pipe) => {
    if (!pipe.scored && pipe.x + PIPE_WIDTH < BIRD_X) {
      pipe.scored = true;
      newState.score += 1;
    }
  });

  // Check collisions
  if (checkCollision(newState)) {
    newState.gameOver = true;
  }

  return newState;
}

/**
 * Check if bird collides with pipes or boundaries
 */
export function checkCollision(state: GameState): boolean {
  const bird = state.bird;
  const birdLeft = BIRD_X;
  const birdRight = BIRD_X + BIRD_SIZE;
  const birdTop = bird.y;
  const birdBottom = bird.y + BIRD_SIZE;

  // Check ground and ceiling
  if (birdBottom >= state.canvasHeight || birdTop <= 0) {
    return true;
  }

  // Check pipe collisions
  for (const pipe of state.pipes) {
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + PIPE_WIDTH;
    const topPipeBottom = pipe.topHeight;
    const bottomPipeTop = pipe.topHeight + PIPE_GAP;

    // Check if bird is within pipe's horizontal range
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      // Check collision with top pipe
      if (birdTop < topPipeBottom) {
        return true;
      }
      // Check collision with bottom pipe
      if (birdBottom > bottomPipeTop) {
        return true;
      }
    }
  }

  return false;
}
