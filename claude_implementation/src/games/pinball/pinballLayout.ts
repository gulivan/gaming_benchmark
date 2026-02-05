export const TABLE_WIDTH = 400;
export const TABLE_HEIGHT = 700;

export interface Bumper {
  x: number;
  y: number;
  radius: number;
}

export interface Flipper {
  x: number;
  y: number;
  length: number;
  angle: number;
  side: 'left' | 'right';
}

export const BUMPERS: Bumper[] = [
  { x: 200, y: 150, radius: 20 },
  { x: 120, y: 250, radius: 18 },
  { x: 280, y: 250, radius: 18 },
  { x: 100, y: 380, radius: 16 },
  { x: 300, y: 380, radius: 16 },
  { x: 200, y: 480, radius: 17 },
];

export const LEFT_FLIPPER: Flipper = {
  x: 120,
  y: 620,
  length: 80,
  angle: 30,
  side: 'left',
};

export const RIGHT_FLIPPER: Flipper = {
  x: 280,
  y: 620,
  length: 80,
  angle: 150,
  side: 'right',
};

export const LAUNCHER_X = 360;
