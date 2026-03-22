import type { PersistentStats } from "./types";

const STORAGE_KEY = "t3-persistent-stats-v1";

export function loadPersistentStats(): PersistentStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { wins: 0, losses: 0, draws: 0 };
    const p = JSON.parse(raw) as Record<string, unknown>;
    return {
      wins: Math.max(0, Number(p.wins) || 0),
      losses: Math.max(0, Number(p.losses) || 0),
      draws: Math.max(0, Number(p.draws) || 0),
    };
  } catch {
    return { wins: 0, losses: 0, draws: 0 };
  }
}

export function savePersistentStats(stats: PersistentStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    /* ignore quota / private mode */
  }
}
