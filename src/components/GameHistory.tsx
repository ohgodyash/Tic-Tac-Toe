import type { GameHistoryEntry } from "../game/types";

interface GameHistoryProps {
  history: GameHistoryEntry[];
}

export function GameHistory({ history }: GameHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="game-history empty">
        <p>No games played yet</p>
      </div>
    );
  }

  return (
    <div className="game-history">
      <h3 className="history-title">Last 10 Games</h3>
      <div className="history-list">
        {history.map((entry) => (
          <div key={entry.id} className="history-item">
            <div className="history-info">
              <span className={`winner-badge ${entry.winner.toLowerCase()}`}>
                {entry.winner === "Draw" ? "Draw" : `${entry.winner} won`}
              </span>
              <span className="history-meta">
                {entry.gridSize}×{entry.gridSize} • {entry.mode === "vsComputer" ? "VS AI" : "2P"}
              </span>
            </div>
            <div className="history-time">
              {new Date(entry.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
