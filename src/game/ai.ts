import { applyMove, evaluateOutcome, getEmptyIndices } from "./engine";
import type { AiDifficulty, Board, GameSnapshot, Player } from "./types";
import { AI_PLAYER, HUMAN_PLAYER } from "./types";

/**
 * Picks the AI's move. Returns index or -1 if no move (should not happen).
 */
export function chooseAiMove(
  difficulty: AiDifficulty,
  snapshot: GameSnapshot,
  winLines: readonly (readonly number[])[]
): number {
  const board = snapshot.board;
  const size = snapshot.gridSize;
  const empties = getEmptyIndices(board);
  if (empties.length === 0) return -1;

  switch (difficulty) {
    case "easy":
      return empties[Math.floor(Math.random() * empties.length)];

    case "medium":
      return mediumMove(board, size, winLines, empties);

    case "hard":
      if (size === 3 && snapshot.winLength === 3) {
        const m = minimaxBestMove(board, winLines, size);
        if (m >= 0) return m;
      }
      return hardFallbackMove(board, size, winLines, empties);

    default:
      return empties[0];
  }
}

function mediumMove(
  board: Board,
  size: number,
  winLines: readonly (readonly number[])[],
  empties: number[]
): number {
  const win = findWinningMove(board, winLines, AI_PLAYER);
  if (win !== null) return win;

  const block = findWinningMove(board, winLines, HUMAN_PLAYER);
  if (block !== null) return block;

  const center = Math.floor((size * size - 1) / 2);
  if (board[center] === "") return center;

  const corners = [0, size - 1, size * (size - 1), size * size - 1].filter(
    (i) => empties.includes(i)
  );
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  return empties[Math.floor(Math.random() * empties.length)];
}

function findWinningMove(
  board: Board,
  winLines: readonly (readonly number[])[],
  player: Player
): number | null {
  for (const line of winLines) {
    const marks = line.filter((i) => board[i] === player).length;
    const empty = line.filter((i) => board[i] === "").length;
    if (marks === line.length - 1 && empty === 1) {
      const idx = line.find((i) => board[i] === "");
      if (idx !== undefined) return idx;
    }
  }
  return null;
}

/** When exact minimax is skipped (large boards), use strong heuristic + light randomness */
function hardFallbackMove(
  board: Board,
  size: number,
  winLines: readonly (readonly number[])[],
  empties: number[]
): number {
  const win = findWinningMove(board, winLines, AI_PLAYER);
  if (win !== null) return win;

  const block = findWinningMove(board, winLines, HUMAN_PLAYER);
  if (block !== null) return block;

  const strategicWin = findStrategicMove(board, winLines, AI_PLAYER);
  if (strategicWin !== null) return strategicWin;

  const strategicBlock = findStrategicMove(board, winLines, HUMAN_PLAYER);
  if (strategicBlock !== null) return strategicBlock;

  return mediumMove(board, size, winLines, empties);
}

function findStrategicMove(
  board: Board,
  winLines: readonly (readonly number[])[],
  player: Player
): number | null {
  // Look for lines that have 2 or more player marks and are otherwise empty
  for (let threshold = Math.max(2, winLines[0].length - 2); threshold >= 2; threshold--) {
    for (const line of winLines) {
      const marks = line.filter((i) => board[i] === player).length;
      const empty = line.filter((i) => board[i] === "").length;
      if (marks === threshold && empty === line.length - threshold) {
        const idx = line.find((i) => board[i] === "");
        if (idx !== undefined) return idx;
      }
    }
  }
  return null;
}

function minimaxBestMove(
  board: Board,
  winLines: readonly (readonly number[])[],
  size: number
): number {
  const empties = getEmptyIndices(board);
  if (empties.length === 0) return -1;

  let bestMove = -1;
  let bestScore = -Infinity;

  for (const move of empties) {
    const next = applyMove(board, move, AI_PLAYER, size)!;
    const score = minimaxScore(
      next,
      winLines,
      size,
      HUMAN_PLAYER,
      -Infinity,
      Infinity
    );
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove >= 0 ? bestMove : empties[0];
}

/**
 * Minimax with alpha-beta pruning. AI (O) maximizes, human (X) minimizes.
 * Terminal scores: win AI +10, win human -10, draw 0.
 */
function minimaxScore(
  board: Board,
  winLines: readonly (readonly number[])[],
  size: number,
  nextPlayer: Player,
  alpha: number,
  beta: number
): number {
  const outcome = evaluateOutcome(board, winLines);
  if (outcome.kind === "win") {
    return outcome.winner === AI_PLAYER ? 10 : -10;
  }
  if (outcome.kind === "draw") {
    return 0;
  }

  const moves = getEmptyIndices(board);
  const maximizing = nextPlayer === AI_PLAYER;

  if (maximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      const nb = applyMove(board, m, AI_PLAYER, size)!;
      const ev = minimaxScore(nb, winLines, size, HUMAN_PLAYER, alpha, beta);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (const m of moves) {
    const nb = applyMove(board, m, HUMAN_PLAYER, size)!;
    const ev = minimaxScore(nb, winLines, size, AI_PLAYER, alpha, beta);
    minEval = Math.min(minEval, ev);
    beta = Math.min(beta, ev);
    if (beta <= alpha) break;
  }
  return minEval;
}
