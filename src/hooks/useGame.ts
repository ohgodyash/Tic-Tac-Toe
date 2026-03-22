import { useCallback, useReducer } from "react";
import {
  applyMove,
  defaultWinLength,
  evaluateOutcome,
  generateWinLines,
  initialSnapshot,
  nextPlayer,
} from "../game/engine";
import type {
  AiDifficulty,
  GameMode,
  GameScores,
  GameSnapshot,
  GridSize,
  Player,
} from "../game/types";

export interface GameSettings {
  mode: GameMode;
  difficulty: AiDifficulty;
  gridSize: GridSize;
}

export interface GameStateModel {
  settings: GameSettings;
  snapshot: GameSnapshot;
  scores: GameScores;
  winLines: readonly (readonly number[])[];
}

const defaultSettings: GameSettings = {
  mode: "twoPlayer",
  difficulty: "medium",
  gridSize: 3,
};

function computeWinLines(gridSize: GridSize, winLength: number) {
  return generateWinLines(gridSize, winLength) as readonly (readonly number[])[];
}

function initialState(): GameStateModel {
  const gs = defaultSettings.gridSize;
  const wl = defaultWinLength(gs);
  return {
    settings: { ...defaultSettings },
    winLines: computeWinLines(gs, wl),
    snapshot: initialSnapshot(gs, wl),
    scores: { X: 0, O: 0, D: 0 },
  };
}

type GameAction =
  | { type: "MOVE"; index: number }
  | { type: "RESET_ROUND" }
  | { type: "RESET_SCORES" }
  | { type: "SET_MODE"; mode: GameMode }
  | { type: "SET_DIFFICULTY"; difficulty: AiDifficulty }
  | { type: "SET_GRID_SIZE"; gridSize: GridSize };

function reducer(state: GameStateModel, action: GameAction): GameStateModel {
  switch (action.type) {
    case "RESET_SCORES": {
      const wl = defaultWinLength(state.settings.gridSize);
      return {
        ...state,
        scores: { X: 0, O: 0, D: 0 },
        snapshot: initialSnapshot(state.settings.gridSize, wl),
      };
    }

    case "RESET_ROUND": {
      const wl = defaultWinLength(state.settings.gridSize);
      return {
        ...state,
        snapshot: initialSnapshot(state.settings.gridSize, wl),
      };
    }

    case "SET_MODE": {
      const wl = defaultWinLength(state.settings.gridSize);
      return {
        ...state,
        settings: { ...state.settings, mode: action.mode },
        snapshot: initialSnapshot(state.settings.gridSize, wl),
      };
    }

    case "SET_DIFFICULTY": {
      const wl = defaultWinLength(state.settings.gridSize);
      return {
        ...state,
        settings: { ...state.settings, difficulty: action.difficulty },
        snapshot: initialSnapshot(state.settings.gridSize, wl),
      };
    }

    case "SET_GRID_SIZE": {
      const gridSize = action.gridSize;
      const wl = defaultWinLength(gridSize);
      return {
        ...state,
        settings: { ...state.settings, gridSize },
        winLines: computeWinLines(gridSize, wl),
        snapshot: initialSnapshot(gridSize, wl),
      };
    }

    case "MOVE": {
      const { snapshot, scores, winLines } = state;
      if (snapshot.phase !== "playing") return state;

      const player: Player = snapshot.currentPlayer;
      const nextBoard = applyMove(
        snapshot.board,
        action.index,
        player,
        snapshot.gridSize
      );
      if (!nextBoard) return state;

      const outcome = evaluateOutcome(nextBoard, winLines);

      if (outcome.kind === "win") {
        const newScores: GameScores = {
          ...scores,
          [outcome.winner]: scores[outcome.winner] + 1,
        };
        return {
          ...state,
          scores: newScores,
          snapshot: {
            ...snapshot,
            board: nextBoard,
            currentPlayer: player,
            phase: "won",
            winner: outcome.winner,
            winningLine: [...outcome.line],
          },
        };
      }

      if (outcome.kind === "draw") {
        return {
          ...state,
          scores: { ...scores, D: scores.D + 1 },
          snapshot: {
            ...snapshot,
            board: nextBoard,
            currentPlayer: player,
            phase: "draw",
            winner: null,
            winningLine: null,
          },
        };
      }

      return {
        ...state,
        snapshot: {
          ...snapshot,
          board: nextBoard,
          currentPlayer: nextPlayer(player),
          phase: "playing",
          winner: null,
          winningLine: null,
        },
      };
    }

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const playMove = useCallback((index: number) => {
    dispatch({ type: "MOVE", index });
  }, []);

  const resetRound = useCallback(() => {
    dispatch({ type: "RESET_ROUND" });
  }, []);

  const resetScores = useCallback(() => {
    dispatch({ type: "RESET_SCORES" });
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    dispatch({ type: "SET_MODE", mode });
  }, []);

  const setDifficulty = useCallback((difficulty: AiDifficulty) => {
    dispatch({ type: "SET_DIFFICULTY", difficulty });
  }, []);

  const setGridSize = useCallback((gridSize: GridSize) => {
    dispatch({ type: "SET_GRID_SIZE", gridSize });
  }, []);

  return {
    settings: state.settings,
    snapshot: state.snapshot,
    scores: state.scores,
    winLines: state.winLines,
    playMove,
    resetRound,
    resetScores,
    setMode,
    setDifficulty,
    setGridSize,
  };
}
