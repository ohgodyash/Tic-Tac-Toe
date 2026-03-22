import { useLayoutEffect, useRef, useState } from "react";
import type { Board as BoardType, GamePhase, GridSize } from "../game/types";
import { Cell } from "./Cell";

export interface BoardProps {
  gridSize: GridSize;
  board: BoardType;
  phase: GamePhase;
  winningLine: number[] | null;
  /** When true, human cannot place a mark (e.g. AI's turn) */
  interactionLocked?: boolean;
  onCellClick: (index: number) => void;
}

export function Board({
  gridSize,
  board,
  phase,
  winningLine,
  interactionLocked = false,
  onCellClick,
}: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [lineCoords, setLineCoords] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    show: boolean;
  }>({ x1: 0, y1: 0, x2: 0, y2: 0, show: false });

  const lineLen = winningLine?.length ?? 0;

  useLayoutEffect(() => {
    if (!winningLine || lineLen < 2 || phase !== "won") {
      setLineCoords((s) => ({ ...s, show: false }));
      return;
    }

    const grid = boardRef.current;
    const first = cellRefs.current[winningLine[0]];
    const last = cellRefs.current[winningLine[lineLen - 1]];
    if (!grid || !first || !last) return;

    const gridRect = grid.getBoundingClientRect();
    const r1 = first.getBoundingClientRect();
    const r2 = last.getBoundingClientRect();

    const x1 = r1.left + r1.width / 2 - gridRect.left;
    const y1 = r1.top + r1.height / 2 - gridRect.top;
    const x2 = r2.left + r2.width / 2 - gridRect.left;
    const y2 = r2.top + r2.height / 2 - gridRect.top;
    const w = gridRect.width;
    const h = gridRect.height;

    setLineCoords({
      x1: (x1 / w) * 100,
      y1: (y1 / h) * 100,
      x2: (x2 / w) * 100,
      y2: (y2 / h) * 100,
      show: true,
    });
  }, [winningLine, phase, board, lineLen]);

  const playable = phase === "playing" && !interactionLocked;

  const gap = gridSize >= 5 ? 6 : gridSize === 4 ? 8 : 10;

  return (
    <div className="boardWrap">
      <svg
        className={`winOverlay ${lineCoords.show ? "isActive" : ""}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <line
          pathLength={1}
          x1={lineCoords.x1}
          y1={lineCoords.y1}
          x2={lineCoords.x2}
          y2={lineCoords.y2}
        />
      </svg>

      <div
        className={`board board--size-${gridSize}`}
        ref={boardRef}
        role="grid"
        aria-label={`Tic Tac Toe grid ${gridSize} by ${gridSize}`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {board.map((value, index) => {
          const isWinning = Boolean(
            winningLine?.includes(index) && phase === "won"
          );
          const disabled = !playable || value !== "";

          return (
            <Cell
              key={index}
              ref={(el) => {
                cellRefs.current[index] = el;
              }}
              gridSize={gridSize}
              value={value}
              disabled={disabled}
              isWinning={isWinning}
              onClick={() => onCellClick(index)}
              aria-label={`Cell ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
