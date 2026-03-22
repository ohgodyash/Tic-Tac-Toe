import { useEffect, useRef, type ReactNode } from "react";
import { Board } from "./components/Board";
import { GameControls } from "./components/GameControls";
import { GameStatus } from "./components/GameStatus";
import { Scoreboard } from "./components/Scoreboard";
import { StatsPanel } from "./components/StatsPanel";
import { TurnIndicator } from "./components/TurnIndicator";
import type { GamePhase, GameSnapshot } from "./game/types";
import { AI_PLAYER, HUMAN_PLAYER } from "./game/types";
import { useAiOpponent } from "./hooks/useAiOpponent";
import type { GameSettings } from "./hooks/useGame";
import { useGame } from "./hooks/useGame";
import { usePersistentStats } from "./hooks/usePersistentStats";
import { useSound } from "./hooks/useSound";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const {
    settings,
    snapshot,
    scores,
    winLines,
    playMove,
    resetRound,
    resetScores,
    setMode,
    setDifficulty,
    setGridSize,
  } = useGame();

  const { stats, recordVsAiResult, resetPersistent } = usePersistentStats();
  const { theme, toggle: toggleTheme } = useTheme();
  const {
    enabled: soundEnabled,
    toggle: toggleSound,
    playClick,
    playWin,
    playDraw,
  } = useSound();

  useAiOpponent(
    settings.mode,
    snapshot,
    winLines,
    settings.difficulty,
    playMove,
    playClick
  );

  const prevPhaseSound = useRef<GamePhase | null>(null);
  useEffect(() => {
    if (
      prevPhaseSound.current === "playing" &&
      snapshot.phase === "won"
    ) {
      playWin();
    }
    if (
      prevPhaseSound.current === "playing" &&
      snapshot.phase === "draw"
    ) {
      playDraw();
    }
    prevPhaseSound.current = snapshot.phase;
  }, [snapshot.phase, playWin, playDraw]);

  const prevPhasePersist = useRef<GamePhase | null>(null);
  useEffect(() => {
    if (settings.mode !== "vsComputer") {
      prevPhasePersist.current = snapshot.phase;
      return;
    }
    if (
      prevPhasePersist.current === "playing" &&
      snapshot.phase === "won"
    ) {
      if (snapshot.winner === HUMAN_PLAYER) recordVsAiResult("win");
      if (snapshot.winner === AI_PLAYER) recordVsAiResult("loss");
    }
    if (
      prevPhasePersist.current === "playing" &&
      snapshot.phase === "draw"
    ) {
      recordVsAiResult("draw");
    }
    prevPhasePersist.current = snapshot.phase;
  }, [
    settings.mode,
    snapshot.phase,
    snapshot.winner,
    recordVsAiResult,
  ]);

  const humanLocked =
    settings.mode === "vsComputer" && snapshot.currentPlayer === "O";

  const handleCellClick = (index: number) => {
    if (snapshot.phase !== "playing") return;
    if (humanLocked) return;
    playClick();
    playMove(index);
  };

  const { title, hint } = statusContent(snapshot, settings);

  return (
    <div className="wrap">
      <header>
        <div className="headerTop">
          <div className="title">
            <h1>Tic Tac Toe</h1>
            <p className="subtitle">Local · AI · variable grid</p>
          </div>

          <div className="controls">
            <button
              className="btn secondary"
              type="button"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={toggleTheme}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button
              className="btn secondary"
              type="button"
              aria-label="Toggle sound"
              onClick={toggleSound}
            >
              {soundEnabled ? "Sound on" : "Sound off"}
            </button>
          </div>
        </div>

        <GameControls
          mode={settings.mode}
          difficulty={settings.difficulty}
          gridSize={settings.gridSize}
          onModeChange={setMode}
          onDifficultyChange={setDifficulty}
          onGridSizeChange={setGridSize}
        />
      </header>

      <section className="card" aria-label="Tic Tac Toe game">
        <div className="cardInner">
          <div className="topRow">
            <div>
              <Scoreboard scores={scores} />
              <StatsPanel
                stats={stats}
                onResetLifetime={resetPersistent}
              />
            </div>
            <GameStatus title={title} hint={hint} onReset={resetRound} />
          </div>

          <TurnIndicator
            mode={settings.mode}
            phase={snapshot.phase}
            currentPlayer={snapshot.currentPlayer}
          />

          <div className="boardArea">
            <Board
              gridSize={snapshot.gridSize}
              board={snapshot.board}
              phase={snapshot.phase}
              winningLine={snapshot.winningLine}
              interactionLocked={humanLocked}
              onCellClick={handleCellClick}
            />

            <div className="actions">
              <div className="smallNote">
                {snapshot.gridSize}×{snapshot.gridSize} · {snapshot.winLength}{" "}
                in a row
                {settings.mode === "vsComputer" ? " · you are X" : ""}
              </div>
              <div className="btnRow">
                <button
                  className="btn secondary"
                  type="button"
                  title="Reset session scoreboard"
                  onClick={resetScores}
                >
                  Reset session scores
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function statusContent(
  snapshot: GameSnapshot,
  settings: GameSettings
): {
  title: ReactNode;
  hint: string;
} {
  if (snapshot.phase === "won" && snapshot.winner) {
    return {
      title: <strong>{snapshot.winner} wins!</strong>,
      hint: "Nice play. Hit Reset to start a new round.",
    };
  }
  if (snapshot.phase === "draw") {
    return {
      title: <strong>Draw!</strong>,
      hint: "No winner this round. Hit Reset to play again.",
    };
  }

  const p = snapshot.currentPlayer;
  if (settings.mode === "vsComputer") {
    const isYou = p === HUMAN_PLAYER;
    return {
      title: (
        <>
          <strong>{isYou ? "Your turn (X)" : "AI thinking… (O)"}</strong>
        </>
      ),
      hint: isYou ? "Tap a cell to place X." : "Wait for the computer move.",
    };
  }

  return {
    title: (
      <>
        <strong>Player {p}</strong> to move
      </>
    ),
    hint: "Make your move.",
  };
}
