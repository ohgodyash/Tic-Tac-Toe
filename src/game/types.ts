export type Player = "X" | "O";

export type CellValue = "" | Player;

export type Board = CellValue[];

export type GamePhase = "playing" | "won" | "draw";

export type GameMode = "twoPlayer" | "vsComputer";

export type AiDifficulty = "easy" | "medium" | "hard";

/** Supported board dimensions */
export type GridSize = 3 | 4 | 5;

export interface GameSnapshot {
  gridSize: GridSize;
  winLength: number;
  board: Board;
  currentPlayer: Player;
  phase: GamePhase;
  winner: Player | null;
  winningLine: number[] | null;
}

export interface GameScores {
  X: number;
  O: number;
  D: number;
}

export interface GameHistoryEntry {
  id: string;
  winner: Player | "Draw";
  gridSize: GridSize;
  mode: GameMode;
  timestamp: number;
}

/** Lifetime stats for vs-AI (human plays X) */
export interface PersistentStats {
  wins: number;
  losses: number;
  draws: number;
  history: GameHistoryEntry[];
}

export const HUMAN_PLAYER: Player = "X";
export const AI_PLAYER: Player = "O";
