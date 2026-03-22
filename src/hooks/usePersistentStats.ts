import { useCallback, useState } from "react";
import { loadPersistentStats, savePersistentStats } from "../game/persistence";
import type { PersistentStats } from "../game/types";

export function usePersistentStats() {
  const [stats, setStats] = useState<PersistentStats>(() => loadPersistentStats());

  const recordVsAiResult = useCallback((result: "win" | "loss" | "draw") => {
    setStats((prev) => {
      const next: PersistentStats = {
        ...prev,
        wins: result === "win" ? prev.wins + 1 : prev.wins,
        losses: result === "loss" ? prev.losses + 1 : prev.losses,
        draws: result === "draw" ? prev.draws + 1 : prev.draws,
      };
      savePersistentStats(next);
      return next;
    });
  }, []);

  const resetPersistent = useCallback(() => {
    const empty: PersistentStats = { wins: 0, losses: 0, draws: 0 };
    savePersistentStats(empty);
    setStats(empty);
  }, []);

  return { stats, recordVsAiResult, resetPersistent };
}
