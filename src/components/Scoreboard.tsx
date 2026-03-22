import type { GameScores } from "../game/types";

export interface ScoreboardProps {
  scores: GameScores;
}

export function Scoreboard({ scores }: ScoreboardProps) {
  return (
    <div className="scoreboard" aria-label="Scoreboard">
      <div className="scoreBox">
        <div className="scoreLabel">Player X</div>
        <div className="scoreValue">
          <span className="dot x" />
          <span>{scores.X}</span>
        </div>
      </div>
      <div className="scoreBox">
        <div className="scoreLabel">Player O</div>
        <div className="scoreValue">
          <span className="dot o" />
          <span>{scores.O}</span>
        </div>
      </div>
      <div className="scoreBox">
        <div className="scoreLabel">Draws</div>
        <div className="scoreValue">
          <span className="dot d" />
          <span>{scores.D}</span>
        </div>
      </div>
    </div>
  );
}
