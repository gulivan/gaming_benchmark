import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BUMPERS,
  LEFT_FLIPPER,
  RIGHT_FLIPPER,
  LAUNCHER_X,
} from './pinballLayout';

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface PinballState {
  ball: Ball;
  score: number;
  gameOver: boolean;
  leftFlipperUp: boolean;
  rightFlipperUp: boolean;
  launched: boolean;
}

export const GRAVITY = 0.3;
export const BALL_RADIUS = 8;
export const DAMPING = 0.98;
export const FLIPPER_FORCE = 12;

export function createInitialState(): PinballState {
  return {
    ball: {
      x: LAUNCHER_X,
      y: TABLE_HEIGHT - 100,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
    },
    score: 0,
    gameOver: false,
    leftFlipperUp: false,
    rightFlipperUp: false,
    launched: false,
  };
}

export function launchBall(state: PinballState): PinballState {
  return {
    ...state,
    ball: {
      ...state.ball,
      vy: -15,
    },
    launched: true,
  };
}

export function setFlipperUp(
  state: PinballState,
  side: 'left' | 'right',
  up: boolean
): PinballState {
  if (side === 'left') {
    return { ...state, leftFlipperUp: up };
  } else {
    return { ...state, rightFlipperUp: up };
  }
}

function getFlipperAngle(
  baseAngle: number,
  isUp: boolean,
  side: 'left' | 'right'
): number {
  if (!isUp) return baseAngle;
  if (side === 'left') {
    return baseAngle - 60;
  } else {
    return baseAngle + 60;
  }
}

function getFlipperEndpoint(flipper: any, angle: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: flipper.x + flipper.length * Math.cos(rad),
    y: flipper.y + flipper.length * Math.sin(rad),
  };
}

function checkLineCircleCollision(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  r: number
): { collision: boolean; nx: number; ny: number; closestX: number; closestY: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;

  const t = Math.max(0, Math.min(len, (cx - x1) * ux + (cy - y1) * uy));
  const closestX = x1 + t * ux;
  const closestY = y1 + t * uy;

  const distX = cx - closestX;
  const distY = cy - closestY;
  const dist = Math.sqrt(distX * distX + distY * distY);

  if (dist < r) {
    const nx = distX / dist;
    const ny = distY / dist;
    return { collision: true, nx, ny, closestX, closestY };
  }

  return { collision: false, nx: 0, ny: 0, closestX, closestY };
}

export function update(state: PinballState): PinballState {
  if (state.gameOver) return state;

  let ball = { ...state.ball };
  let score = state.score;

  if (state.launched) {
    ball.vy += GRAVITY;
  }

  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.vx *= DAMPING;
  ball.vy *= DAMPING;

  let gameOver = false;

  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = -ball.vx * 0.8;
    score += 10;
  }
  if (ball.x + ball.radius > TABLE_WIDTH) {
    ball.x = TABLE_WIDTH - ball.radius;
    ball.vx = -ball.vx * 0.8;
    score += 10;
  }
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = -ball.vy * 0.8;
  }
  if (ball.y + ball.radius > TABLE_HEIGHT) {
    gameOver = true;
  }

  for (const bumper of BUMPERS) {
    const dx = ball.x - bumper.x;
    const dy = ball.y - bumper.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = ball.radius + bumper.radius;

    if (dist < minDist) {
      const nx = dx / dist;
      const ny = dy / dist;
      ball.x = bumper.x + nx * minDist;
      ball.y = bumper.y + ny * minDist;
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      ball.vx = nx * (speed + 8);
      ball.vy = ny * (speed + 8);
      score += 100;
    }
  }

  if (state.leftFlipperUp) {
    const leftAngle = getFlipperAngle(LEFT_FLIPPER.angle, true, 'left');
    const leftEnd = getFlipperEndpoint(LEFT_FLIPPER, leftAngle);
    const leftCollision = checkLineCircleCollision(
      LEFT_FLIPPER.x,
      LEFT_FLIPPER.y,
      leftEnd.x,
      leftEnd.y,
      ball.x,
      ball.y,
      ball.radius
    );

    if (leftCollision.collision) {
      ball.x = leftCollision.closestX + leftCollision.nx * ball.radius;
      ball.y = leftCollision.closestY + leftCollision.ny * ball.radius;
      ball.vx = leftCollision.nx * FLIPPER_FORCE;
      ball.vy = -Math.abs(leftCollision.ny * FLIPPER_FORCE);
    }
  }

  if (state.rightFlipperUp) {
    const rightAngle = getFlipperAngle(RIGHT_FLIPPER.angle, true, 'right');
    const rightEnd = getFlipperEndpoint(RIGHT_FLIPPER, rightAngle);
    const rightCollision = checkLineCircleCollision(
      RIGHT_FLIPPER.x,
      RIGHT_FLIPPER.y,
      rightEnd.x,
      rightEnd.y,
      ball.x,
      ball.y,
      ball.radius
    );

    if (rightCollision.collision) {
      ball.x = rightCollision.closestX + rightCollision.nx * ball.radius;
      ball.y = rightCollision.closestY + rightCollision.ny * ball.radius;
      ball.vx = rightCollision.nx * FLIPPER_FORCE;
      ball.vy = -Math.abs(rightCollision.ny * FLIPPER_FORCE);
    }
  }

  return {
    ...state,
    ball,
    score,
    gameOver,
    leftFlipperUp: state.leftFlipperUp,
    rightFlipperUp: state.rightFlipperUp,
  };
}
