import { useCallback, useEffect, useState } from "react";
import { loadPersistentStats, savePersistentStats } from "../game/persistence";
import type { PersistentStats, GameHistoryEntry } from "../game/types";

export function usePersistentStats() {
  const [stats, setStats] = useState<PersistentStats>(() => loadPersistentStats());

  useEffect(() => {
    savePersistentStats(stats);
  }, [stats]);

  const recordVsAiResult = useCallback((result: "win" | "loss" | "draw") => {
    setStats((prev) => {
      return {
        ...prev,
        wins: result === "win" ? prev.wins + 1 : prev.wins,
        losses: result === "loss" ? prev.losses + 1 : prev.losses,
        draws: result === "draw" ? prev.draws + 1 : prev.draws,
      };
    });
  }, []);

  const addHistoryEntry = useCallback((entry: Omit<GameHistoryEntry, "id" | "timestamp">) => {
    setStats((prev) => {
      const newEntry: GameHistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      return {
        ...prev,
        history: [newEntry, ...prev.history].slice(0, 20),
      };
    });
  }, []);

  const resetPersistent = useCallback(() => {
    setStats({ wins: 0, losses: 0, draws: 0, history: [] });
  }, []);

  return { stats, recordVsAiResult, addHistoryEntry, resetPersistent };
}
