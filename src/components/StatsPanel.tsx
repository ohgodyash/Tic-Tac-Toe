import type { PersistentStats } from "../game/types";

export interface StatsPanelProps {
  stats: PersistentStats;
  onResetLifetime: () => void;
}

export function StatsPanel({ stats, onResetLifetime }: StatsPanelProps) {
  return (
    <div className="statsPanel" aria-label="Lifetime statistics vs AI">
      <div className="statsPanel__title">Lifetime vs AI</div>
      <div className="statsPanel__row">
        <span className="statsPanel__item">
          <span className="statsPanel__label">Wins</span>
          <strong>{stats.wins}</strong>
        </span>
        <span className="statsPanel__item">
          <span className="statsPanel__label">Losses</span>
          <strong>{stats.losses}</strong>
        </span>
        <span className="statsPanel__item">
          <span className="statsPanel__label">Draws</span>
          <strong>{stats.draws}</strong>
        </span>
      </div>
      <button
        type="button"
        className="btn secondary statsPanel__reset"
        onClick={onResetLifetime}
      >
        Clear lifetime stats
      </button>
    </div>
  );
}
