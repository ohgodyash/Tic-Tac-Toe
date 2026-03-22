# Tic Tac Toe

<p align="center">
  <img src="assets/readme-banner.png" alt="Tic Tac Toe - modern purple gradient UI with glowing X and O on a grid" width="800" />
</p>

Production-style **React + TypeScript + Vite** app: modular **game engine**, **AI opponents**, **variable grid sizes**, **local persistence**, and polished UI.

## Run

```bash
npm install
npm run dev
```

Open the URL shown (usually `http://localhost:5173`).

```bash
npm run build    # typecheck + production bundle
npm run preview  # serve dist/
```

## Features

| Area | Details |
|------|---------|
| **Modes** | Two players on one device, or **vs computer** (you are **X**, AI is **O**) |
| **AI** | **Easy** (random legal moves), **Medium** (win/block + center/corners), **Hard** (optimal **minimax + α–β** on **3×3**; on larger boards uses the same heuristics as Medium) |
| **Grids** | **3×3** (3 in a row), **4×4** (4 in a row), **5×5** (4 in a row) |
| **State** | `useReducer` game state; session scoreboard (X / O / draws) |
| **Persistence** | **localStorage** lifetime stats for vs AI: wins, losses, draws (+ clear button) |
| **UI** | Win line overlay, hover, turn indicator, dark/light theme, sound, responsive layout |
| **Legacy** | Original static site in `legacy/vanilla/` |

## Project layout

```
src/
  game/
    engine.ts      # Board ops, win-line generation, outcomes
    ai.ts          # Easy / medium / minimax AI
    persistence.ts # localStorage helpers
    types.ts
  hooks/
    useGame.ts           # reducer + settings
    useAiOpponent.ts     # delayed AI moves
    usePersistentStats.ts
    useSound.ts
    useTheme.ts
  components/
    Board.tsx, Cell.tsx, GameStatus.tsx, Scoreboard.tsx
    GameControls.tsx, TurnIndicator.tsx, StatsPanel.tsx
```

## Docs

- **`docs/PHASE1.md`** — original refactor notes (architecture still applies).

## Assets

- `assets/readme-banner.png` — README banner
