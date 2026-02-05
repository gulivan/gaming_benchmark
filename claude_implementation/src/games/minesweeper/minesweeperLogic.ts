export const ROWS = 9;
export const COLS = 9;
export const MINES = 10;

export type CellState = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentMines: number;
};

export type Board = CellState[][];

export function createBoard(
  rows: number,
  cols: number,
  mineCount: number,
  safeRow: number,
  safeCol: number
): Board {
  // Initialize empty board
  const board: Board = Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => ({
          mine: false,
          revealed: false,
          flagged: false,
          adjacentMines: 0,
        }))
    );

  // Determine forbidden cells (safe cell and its neighbors)
  const forbidden = new Set<string>();
  forbidden.add(`${safeRow},${safeCol}`);
  for (let r = safeRow - 1; r <= safeRow + 1; r++) {
    for (let c = safeCol - 1; c <= safeCol + 1; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        forbidden.add(`${r},${c}`);
      }
    }
  }

  // Place mines randomly
  let placedMines = 0;
  while (placedMines < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    if (!board[r][c].mine && !forbidden.has(`${r},${c}`)) {
      board[r][c].mine = true;
      placedMines++;
    }
  }

  // Compute adjacent mine counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) {
              count++;
            }
          }
        }
        board[r][c].adjacentMines = count;
      }
    }
  }

  return board;
}

export function revealCell(board: Board, row: number, col: number): Board {
  // Create deep copy of board
  const newBoard = board.map((r) =>
    r.map((cell) => ({ ...cell }))
  );

  if (newBoard[row][col].revealed || newBoard[row][col].flagged) {
    return newBoard;
  }

  newBoard[row][col].revealed = true;

  // If no adjacent mines, flood-fill with BFS
  if (newBoard[row][col].adjacentMines === 0 && !newBoard[row][col].mine) {
    const queue: [number, number][] = [[row, col]];
    const visited = new Set<string>();
    visited.add(`${row},${col}`);

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;

          if (
            nr >= 0 &&
            nr < newBoard.length &&
            nc >= 0 &&
            nc < newBoard[0].length &&
            !visited.has(`${nr},${nc}`)
          ) {
            visited.add(`${nr},${nc}`);

            if (!newBoard[nr][nc].mine && !newBoard[nr][nc].flagged) {
              newBoard[nr][nc].revealed = true;

              if (newBoard[nr][nc].adjacentMines === 0) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }
  }

  return newBoard;
}

export function toggleFlag(board: Board, row: number, col: number): Board {
  const newBoard = board.map((r) =>
    r.map((cell) => ({ ...cell }))
  );

  if (!newBoard[row][col].revealed) {
    newBoard[row][col].flagged = !newBoard[row][col].flagged;
  }

  return newBoard;
}

export function checkWin(board: Board): boolean {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const cell = board[r][c];
      if (!cell.mine && !cell.revealed) {
        return false;
      }
    }
  }
  return true;
}

export function countRevealed(board: Board): number {
  let count = 0;
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      if (board[r][c].revealed && !board[r][c].mine) {
        count++;
      }
    }
  }
  return count;
}

export function revealAll(board: Board): Board {
  return board.map((r) =>
    r.map((cell) => ({
      ...cell,
      revealed: true,
    }))
  );
}
