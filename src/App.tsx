import { useEffect, useRef, type ReactNode } from "react";
import { Board } from "./components/Board";
import { GameControls } from "./components/GameControls";
import { GameHistory } from "./components/GameHistory";
import { GameStatus } from "./components/GameStatus";
import { Scoreboard } from "./components/Scoreboard";
import { StatsPanel } from "./components/StatsPanel";
import { TurnIndicator } from "./components/TurnIndicator";
import type { GamePhase, GameSnapshot, Player } from "./game/types";
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

  const { theme, toggle: toggleTheme } = useTheme();
  const {
    enabled: soundEnabled,
    toggle: toggleSound,
    playClick,
    playWin,
    playDraw,
    playLose,
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
      if (settings.mode === "vsComputer" && snapshot.winner === AI_PLAYER) {
        playLose();
      } else {
        playWin();
      }
    }
    if (
      prevPhaseSound.current === "playing" &&
      snapshot.phase === "draw"
    ) {
      playDraw();
    }
    prevPhaseSound.current = snapshot.phase;
  }, [snapshot.phase, playWin, playDraw, playLose, settings.mode, snapshot.winner]);

  const { stats, recordVsAiResult, addHistoryEntry, resetPersistent } = usePersistentStats();

  const prevPhaseHistory = useRef<GamePhase | null>(null);
   useEffect(() => {
     if (
       prevPhaseHistory.current === "playing" &&
       (snapshot.phase === "won" || snapshot.phase === "draw")
     ) {
       addHistoryEntry({
         winner: snapshot.phase === "won" ? (snapshot.winner as Player) : "Draw",
         gridSize: settings.gridSize,
         mode: settings.mode,
       });

       if (settings.mode === "vsComputer") {
         if (snapshot.phase === "won") {
           if (snapshot.winner === HUMAN_PLAYER) recordVsAiResult("win");
           if (snapshot.winner === AI_PLAYER) recordVsAiResult("loss");
         } else if (snapshot.phase === "draw") {
           recordVsAiResult("draw");
         }
       }
     }
     prevPhaseHistory.current = snapshot.phase;
   }, [
     snapshot.phase,
     snapshot.winner,
     settings.gridSize,
     settings.mode,
     addHistoryEntry,
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

  const { title: statusTitle, hint: statusHint } = statusContent(snapshot, settings);

  return (
    <div className="game-container" data-theme={theme}>
      <aside className="panel-left">
        <header>
          <div className="title">
            <h1>Tic Tac Toe</h1>
            <p className="subtitle">Modern minimalist strategy</p>
          </div>
        </header>

        <section className="section-controls">
          <GameControls
            mode={settings.mode}
            difficulty={settings.difficulty}
            gridSize={settings.gridSize}
            onModeChange={setMode}
            onDifficultyChange={setDifficulty}
            onGridSizeChange={setGridSize}
          />
        </section>

        <section className="section-stats">
          <Scoreboard scores={scores} />
          {settings.mode === "vsComputer" && (
            <StatsPanel stats={stats} onResetLifetime={resetPersistent} />
          )}
        </section>

        <footer className="panel-footer">
          <div className="btnRow">
            <button className="btn secondary" onClick={toggleTheme}>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button className="btn secondary" onClick={toggleSound}>
              {soundEnabled ? "Mute" : "Sound"}
            </button>
            <button
              className="btn secondary"
              onClick={() => {
                resetScores();
                resetPersistent();
              }}
            >
              Reset All
            </button>
          </div>
        </footer>
      </aside>

      <main className="game-main">
        <div className="boardArea">
          <Board
            gridSize={snapshot.gridSize}
            board={snapshot.board}
            phase={snapshot.phase}
            winningLine={snapshot.winningLine}
            interactionLocked={humanLocked}
            onCellClick={handleCellClick}
          />
        </div>
      </main>

      <aside className="panel-right">
        <div className="status-container">
          <GameStatus
            title={statusTitle}
            hint={statusHint}
            onReset={resetRound}
          />
          <TurnIndicator
            mode={settings.mode}
            phase={snapshot.phase}
            currentPlayer={snapshot.currentPlayer}
          />
        </div>

        <GameHistory history={stats.history} />

        <div className="info-box">
          <p className="smallNote">
            {settings.gridSize}×{settings.gridSize} grid • {snapshot.winLength} to win
          </p>
        </div>
      </aside>
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
