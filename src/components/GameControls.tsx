import type { AiDifficulty, GameMode, GridSize } from "../game/types";

export interface GameControlsProps {
  mode: GameMode;
  difficulty: AiDifficulty;
  gridSize: GridSize;
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange: (d: AiDifficulty) => void;
  onGridSizeChange: (s: GridSize) => void;
}

export function GameControls({
  mode,
  difficulty,
  gridSize,
  onModeChange,
  onDifficultyChange,
  onGridSizeChange,
}: GameControlsProps) {
  return (
    <div className="gameControls">
      <div className="pill">
        <label htmlFor="sel-mode">Mode</label>
        <select
          id="sel-mode"
          value={mode}
          onChange={(e) => onModeChange(e.target.value as GameMode)}
        >
          <option value="twoPlayer">Two players</option>
          <option value="vsComputer">Vs computer (you are X)</option>
        </select>
      </div>

      {mode === "vsComputer" && (
        <div className="pill">
          <label htmlFor="sel-difficulty">AI</label>
          <select
            id="sel-difficulty"
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as AiDifficulty)}
          >
            <option value="easy">Easy (random)</option>
            <option value="medium">Medium (blocks / wins)</option>
            <option value="hard">Hard (minimax on 3×3)</option>
          </select>
        </div>
      )}

      <div className="pill">
        <label htmlFor="sel-grid">Grid</label>
        <select
          id="sel-grid"
          value={gridSize}
          onChange={(e) => onGridSizeChange(Number(e.target.value) as GridSize)}
        >
          <option value={3}>3 × 3 (3 in a row)</option>
          <option value={4}>4 × 4 (4 in a row)</option>
          <option value={5}>5 × 5 (4 in a row)</option>
        </select>
      </div>
    </div>
  );
}
