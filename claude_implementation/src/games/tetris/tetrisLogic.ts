import { getRandomTetromino, rotateCW } from './tetrominoes';

export const ROWS = 20;
export const COLS = 10;
export const CELL_SIZE = 30;

export type Board = (string | null)[][];

export type GameState = {
  board: Board;
  current: {
    shape: number[][];
    color: string;
    row: number;
    col: number;
  };
  score: number;
  gameOver: boolean;
  linesCleared: number;
};

export function createEmptyBoard(): Board {
  return Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(null));
}

export function createInitialState(): GameState {
  const tetromino = getRandomTetromino();
  return {
    board: createEmptyBoard(),
    current: {
      shape: tetromino.shape,
      color: tetromino.color,
      row: 0,
      col: Math.floor((COLS - tetromino.shape[0].length) / 2),
    },
    score: 0,
    gameOver: false,
    linesCleared: 0,
  };
}

export function isValidPosition(
  board: Board,
  shape: number[][],
  row: number,
  col: number
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 0) continue;

      const boardRow = row + r;
      const boardCol = col + c;

      if (
        boardRow < 0 ||
        boardRow >= ROWS ||
        boardCol < 0 ||
        boardCol >= COLS
      ) {
        return false;
      }

      if (board[boardRow][boardCol] !== null) {
        return false;
      }
    }
  }
  return true;
}

export function placePiece(state: GameState): GameState {
  const newBoard = state.board.map((row) => [...row]);
  const { shape, color, row: shapeRow, col: shapeCol } = state.current;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        const boardRow = shapeRow + r;
        const boardCol = shapeCol + c;
        if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
          newBoard[boardRow][boardCol] = color;
        }
      }
    }
  }

  const { board: clearedBoard, linesCleared } = clearLines(newBoard);
  const newScore = state.score + linesCleared * 100;

  const nextTetromino = getRandomTetromino();
  const nextCol = Math.floor((COLS - nextTetromino.shape[0].length) / 2);

  if (!isValidPosition(clearedBoard, nextTetromino.shape, 0, nextCol)) {
    return {
      board: clearedBoard,
      current: {
        shape: nextTetromino.shape,
        color: nextTetromino.color,
        row: 0,
        col: nextCol,
      },
      score: newScore,
      gameOver: true,
      linesCleared: state.linesCleared + linesCleared,
    };
  }

  return {
    board: clearedBoard,
    current: {
      shape: nextTetromino.shape,
      color: nextTetromino.color,
      row: 0,
      col: nextCol,
    },
    score: newScore,
    gameOver: false,
    linesCleared: state.linesCleared + linesCleared,
  };
}

export function moveDown(state: GameState): GameState {
  if (state.gameOver) return state;

  const newRow = state.current.row + 1;

  if (
    isValidPosition(
      state.board,
      state.current.shape,
      newRow,
      state.current.col
    )
  ) {
    return {
      ...state,
      current: {
        ...state.current,
        row: newRow,
      },
    };
  }

  return placePiece(state);
}

export function moveLeft(state: GameState): GameState {
  if (state.gameOver) return state;

  const newCol = state.current.col - 1;

  if (
    isValidPosition(
      state.board,
      state.current.shape,
      state.current.row,
      newCol
    )
  ) {
    return {
      ...state,
      current: {
        ...state.current,
        col: newCol,
      },
    };
  }

  return state;
}

export function moveRight(state: GameState): GameState {
  if (state.gameOver) return state;

  const newCol = state.current.col + 1;

  if (
    isValidPosition(
      state.board,
      state.current.shape,
      state.current.row,
      newCol
    )
  ) {
    return {
      ...state,
      current: {
        ...state.current,
        col: newCol,
      },
    };
  }

  return state;
}

export function rotate(state: GameState): GameState {
  if (state.gameOver) return state;

  const rotated = rotateCW(state.current.shape);
  const wallKickOffsets = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [-2, 0],
    [2, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [offsetCol, offsetRow] of wallKickOffsets) {
    const newRow = state.current.row + offsetRow;
    const newCol = state.current.col + offsetCol;

    if (isValidPosition(state.board, rotated, newRow, newCol)) {
      return {
        ...state,
        current: {
          ...state.current,
          shape: rotated,
          row: newRow,
          col: newCol,
        },
      };
    }
  }

  return state;
}

export function hardDrop(state: GameState): GameState {
  if (state.gameOver) return state;

  let currentState = state;
  let dropped = false;

  while (!dropped) {
    const nextRow = currentState.current.row + 1;

    if (
      isValidPosition(
        currentState.board,
        currentState.current.shape,
        nextRow,
        currentState.current.col
      )
    ) {
      currentState = {
        ...currentState,
        current: {
          ...currentState.current,
          row: nextRow,
        },
      };
    } else {
      dropped = true;
    }
  }

  return placePiece(currentState);
}

export function clearLines(board: Board): {
  board: Board;
  linesCleared: number;
} {
  const rowsToRemove: number[] = [];

  for (let r = 0; r < ROWS; r++) {
    if (board[r].every((cell) => cell !== null)) {
      rowsToRemove.push(r);
    }
  }

  if (rowsToRemove.length === 0) {
    return { board, linesCleared: 0 };
  }

  const newBoard = board.filter((_, r) => !rowsToRemove.includes(r));
  while (newBoard.length < ROWS) {
    newBoard.unshift(Array(COLS).fill(null));
  }

  return { board: newBoard, linesCleared: rowsToRemove.length };
}
