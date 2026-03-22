import { forwardRef } from "react";
import type { CellValue, GridSize } from "../game/types";

export interface CellProps {
  gridSize: GridSize;
  value: CellValue;
  disabled: boolean;
  isWinning: boolean;
  onClick: () => void;
  "aria-label": string;
}

export const Cell = forwardRef<HTMLButtonElement, CellProps>(
  function Cell(
    {
      gridSize,
      value,
      disabled,
      isWinning,
      onClick,
      "aria-label": ariaLabel,
    },
    ref
  ) {
    const markClass =
      value === "X" ? "mark-x" : value === "O" ? "mark-o" : "";

    const compact = gridSize > 3;

    return (
      <button
        ref={ref}
        type="button"
        className={`cell ${compact ? "cell--compact" : ""} ${markClass} ${value ? "marked" : ""} ${isWinning ? "win" : ""}`}
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {value}
      </button>
    );
  }
);
