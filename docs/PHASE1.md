# Phase 1 — Refactor + Foundation

## What we built

- **Vite + React 18 + TypeScript** at the project root (`npm run dev`).
- **Game engine** (`src/game/`): pure functions and types only — no React, no DOM. Easier to test and reuse (AI in Phase 2, larger boards in Phase 3).
- **State** (`src/hooks/useGame.ts`): `useReducer` holds `GameSnapshot` + `scores`. All moves go through `dispatch({ type: "MOVE", index })` so updates stay predictable.
- **UI components** (`src/components/`):
  - `Cell` — single square (`forwardRef` for win-line layout math in `Board`).
  - `Board` — 3×3 grid, SVG win overlay, wires clicks to `onCellClick`.
  - `GameStatus` — headline + hint + Reset round.
  - `Scoreboard` — X / O / draws (in-memory only until Phase 4).
- **Cross-cutting**: `useTheme`, `useSound` — presentation side effects, not in the engine.

## Folder layout

```
src/
  game/
    types.ts      # Player, Board, GameSnapshot, …
    engine.ts     # createEmptyBoard, applyMove, evaluateOutcome, …
  hooks/
    useGame.ts    # reducer + public API: playMove, resetRound, resetScores
    useTheme.ts
    useSound.ts
  components/
    Board.tsx
    Cell.tsx
    GameStatus.tsx
    Scoreboard.tsx
  App.tsx
  main.tsx
  index.css
```

## Data flow

1. User clicks a cell → `App` calls `playClick()` (optional) then `playMove(index)`.
2. Reducer applies `applyMove` → `evaluateOutcome`:
   - **Win** → freeze board, set `winningLine`, bump score for winner.
   - **Draw** → bump draws.
   - **Ongoing** → switch `currentPlayer`.
3. `Board` reads `board`, `phase`, `winningLine` and renders `Cell` states + win line SVG.

## Why `useReducer` (not Zustand) for Phase 1

Phase 1 only needs local game state in one tree. `useReducer` keeps transitions explicit and avoids an extra dependency. Zustand (or Context) is easy to add later if multiple screens or multiplayer need shared stores.

## Legacy vanilla build

The previous static site lives in **`legacy/vanilla/`** (`index.html`, `style.css`, `script.js`) for reference.

## Suggested next steps (later phases)

- **Phase 2:** Implement AI in `src/game/ai/` calling only `applyMove` / `evaluateOutcome`; inject delay in `App` or a thin `useAiOpponent` hook.
- **Phase 3:** Replace fixed `WIN_LINES_3` with generators for N×N and K-in-a-row; thread `size` through snapshot.
- **Phase 4:** Persist scores via `localStorage` in a small hook or `useEffect` sync.
