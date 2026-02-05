export type Board = number[][];

export function createEmptyBoard(): Board {
  return Array(4)
    .fill(null)
    .map(() => Array(4).fill(0));
}

export function addRandomTile(board: Board): Board {
  const newBoard = board.map((row) => [...row]);
  const emptyCells: Array<[number, number]> = [];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (newBoard[i][j] === 0) {
        emptyCells.push([i, j]);
      }
    }
  }

  if (emptyCells.length === 0) return newBoard;

  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  newBoard[row][col] = value;

  return newBoard;
}

export function initBoard(): Board {
  let board = createEmptyBoard();
  board = addRandomTile(board);
  board = addRandomTile(board);
  return board;
}

export function slide(row: number[]): { row: number[]; score: number } {
  let score = 0;
  const filtered = row.filter((val) => val !== 0);

  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered.splice(i + 1, 1);
    }
  }

  const newRow = [
    ...filtered,
    ...Array(4 - filtered.length).fill(0),
  ];

  return { row: newRow, score };
}

export function moveLeft(board: Board): { board: Board; score: number } {
  let totalScore = 0;
  const newBoard = board.map((row) => {
    const { row: newRow, score } = slide(row);
    totalScore += score;
    return newRow;
  });

  return { board: newBoard, score: totalScore };
}

export function moveRight(board: Board): { board: Board; score: number } {
  let totalScore = 0;
  const newBoard = board.map((row) => {
    const reversed = [...row].reverse();
    const { row: newRow, score } = slide(reversed);
    totalScore += score;
    return newRow.reverse();
  });

  return { board: newBoard, score: totalScore };
}

export function moveUp(board: Board): { board: Board; score: number } {
  let totalScore = 0;
  const transposed = Array(4)
    .fill(null)
    .map((_, i) => board.map((row) => row[i]));

  const moved = transposed.map((row) => {
    const { row: newRow, score } = slide(row);
    totalScore += score;
    return newRow;
  });

  const newBoard = Array(4)
    .fill(null)
    .map((_, i) => moved.map((row) => row[i]));

  return { board: newBoard, score: totalScore };
}

export function moveDown(board: Board): { board: Board; score: number } {
  let totalScore = 0;
  const transposed = Array(4)
    .fill(null)
    .map((_, i) => board.map((row) => row[i]));

  const moved = transposed.map((row) => {
    const reversed = [...row].reverse();
    const { row: newRow, score } = slide(reversed);
    totalScore += score;
    return newRow.reverse();
  });

  const newBoard = Array(4)
    .fill(null)
    .map((_, i) => moved.map((row) => row[i]));

  return { board: newBoard, score: totalScore };
}

export function hasMovesLeft(board: Board): boolean {
  // Check for empty cells
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) return true;
    }
  }

  // Check if any merges are possible
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const current = board[i][j];
      // Check right
      if (j < 3 && current === board[i][j + 1]) return true;
      // Check down
      if (i < 3 && current === board[i + 1][j]) return true;
    }
  }

  return false;
}

export function boardsEqual(a: Board, b: Board): boolean {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
}
