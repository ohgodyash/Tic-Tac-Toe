import type { Board, CellValue, GameSnapshot, GridSize, Player } from "./types";

export function defaultWinLength(size: GridSize): number {
  if (size === 3) return 3;
  if (size === 4) return 4;
  if (size === 5) return 4; // 5×5 uses 4 in a row by design (per UI/README)
  return 4;
}

/**
 * All straight lines of length `winLength` on an N×N grid (flat indices).
 */
export function generateWinLines(size: number, winLength: number): number[][] {
  if (winLength > size) return [];

  const lines: number[][] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) {
        line.push(r * size + (c + k));
      }
      lines.push(line);
    }
  }

  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - winLength; r++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) {
        line.push((r + k) * size + c);
      }
      lines.push(line);
    }
  }

  for (let r = 0; r <= size - winLength; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) {
        line.push((r + k) * size + (c + k));
      }
      lines.push(line);
    }
  }

  for (let r = 0; r <= size - winLength; r++) {
    for (let c = winLength - 1; c < size; c++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) {
        line.push((r + k) * size + (c - k));
      }
      lines.push(line);
    }
  }

  return lines;
}

export function createEmptyBoard(size: number): Board {
  return Array<CellValue>(size * size).fill("");
}

export function initialSnapshot(
  gridSize: GridSize,
  winLength: number = defaultWinLength(gridSize)
): GameSnapshot {
  return {
    gridSize,
    winLength,
    board: createEmptyBoard(gridSize),
    currentPlayer: "X",
    phase: "playing",
    winner: null,
    winningLine: null,
  };
}

export function applyMove(
  board: Board,
  index: number,
  player: Player,
  size: number
): Board | null {
  if (index < 0 || index >= size * size || board[index] !== "") {
    return null;
  }
  const next = board.slice() as Board;
  next[index] = player;
  return next;
}

export type Outcome =
  | { kind: "ongoing" }
  | { kind: "win"; winner: Player; line: readonly number[] }
  | { kind: "draw" };

export function evaluateOutcome(
  board: Board,
  winLines: readonly (readonly number[])[]
): Outcome {
  for (const line of winLines) {
    const first = board[line[0]];
    if (first === "") continue;
    let all = true;
    for (let i = 1; i < line.length; i++) {
      if (board[line[i]] !== first) {
        all = false;
        break;
      }
    }
    if (all) {
      return { kind: "win", winner: first, line };
    }
  }
  if (board.every((cell) => cell !== "")) {
    return { kind: "draw" };
  }
  return { kind: "ongoing" };
}

export function nextPlayer(current: Player): Player {
  return current === "X" ? "O" : "X";
}

export function getEmptyIndices(board: Board): number[] {
  const out: number[] = [];
  board.forEach((v, i) => {
    if (v === "") out.push(i);
  });
  return out;
}
