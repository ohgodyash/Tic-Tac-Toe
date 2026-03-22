import { useEffect, useRef } from "react";
import { chooseAiMove } from "../game/ai";
import type { AiDifficulty, GameMode, GameSnapshot } from "../game/types";

const AI_DELAY_MS = 450;

/**
 * Schedules AI (O) moves in vs-computer mode with a short delay for UX.
 */
export function useAiOpponent(
  mode: GameMode,
  snapshot: GameSnapshot,
  winLines: readonly (readonly number[])[],
  difficulty: AiDifficulty,
  playMove: (index: number) => void,
  playClick: () => void
): void {
  const moveGen = useRef(0);

  useEffect(() => {
    if (mode !== "vsComputer") return;
    if (snapshot.phase !== "playing") return;
    if (snapshot.currentPlayer !== "O") return;

    const id = ++moveGen.current;
    const idx = chooseAiMove(difficulty, snapshot, winLines);
    if (idx < 0) return;

    const timer = window.setTimeout(() => {
      if (id !== moveGen.current) return;
      playClick();
      playMove(idx);
    }, AI_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [
    mode,
    snapshot.board,
    snapshot.phase,
    snapshot.currentPlayer,
    snapshot.gridSize,
    snapshot.winLength,
    winLines,
    difficulty,
    playMove,
    playClick,
  ]);
}
