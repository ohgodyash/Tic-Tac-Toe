import type { GameMode, GamePhase, Player } from "../game/types";

export interface TurnIndicatorProps {
  mode: GameMode;
  phase: GamePhase;
  currentPlayer: Player;
}

export function TurnIndicator({
  mode,
  phase,
  currentPlayer,
}: TurnIndicatorProps) {
  if (phase !== "playing") return null;

  const xLabel = mode === "vsComputer" ? "You (X)" : "X";
  const oLabel = mode === "vsComputer" ? "AI (O)" : "O";

  return (
    <div className="turnIndicator" aria-live="polite">
      <span
        className={currentPlayer === "X" ? "is-active" : ""}
        title="Player X"
      >
        {xLabel}
      </span>
      <span className="turnIndicator__vs">vs</span>
      <span
        className={currentPlayer === "O" ? "is-active" : ""}
        title="Player O"
      >
        {oLabel}
      </span>
    </div>
  );
}
