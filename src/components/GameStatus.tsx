import type { ReactNode } from "react";

export interface GameStatusProps {
  title: ReactNode;
  hint: string;
  onReset: () => void;
}

export function GameStatus({ title, hint, onReset }: GameStatusProps) {
  return (
    <div className="status" role="status" aria-live="polite">
      <div className="statusText">
        <div id="statusMain" className="fadeIn">
          {title}
        </div>
        <div className="hint">{hint}</div>
      </div>
      <button
        className="btn primary"
        type="button"
        title="Restart this round"
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
