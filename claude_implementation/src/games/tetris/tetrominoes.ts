export type Tetromino = {
  shape: number[][];
  color: string;
};

export const TETROMINOES: Tetromino[] = [
  // I - Cyan
  {
    shape: [
      [1, 1, 1, 1],
    ],
    color: '#00f0f0',
  },
  // O - Yellow
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#f0f000',
  },
  // T - Purple
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#a000f0',
  },
  // S - Green
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#00f000',
  },
  // Z - Red
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#f00000',
  },
  // J - Blue
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#0000f0',
  },
  // L - Orange
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#f0a000',
  },
];

export function getRandomTetromino(): Tetromino {
  const index = Math.floor(Math.random() * TETROMINOES.length);
  return TETROMINOES[index];
}

export function rotateCW(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = [];

  for (let col = 0; col < cols; col++) {
    const newRow: number[] = [];
    for (let row = rows - 1; row >= 0; row--) {
      newRow.push(shape[row][col]);
    }
    rotated.push(newRow);
  }

  return rotated;
}
