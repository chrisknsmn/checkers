import React from "react";
import { GameState } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";
import { labels } from "@/constants/text";

interface TimingRowProps {
  gameState: GameState;
  gameTime: number;
  onShowScoreModal: () => void;
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function TimingRow({
  gameState,
  gameTime,
  onShowScoreModal,
}: TimingRowProps) {
  const getResultText = () => {
    if (gameState.gameStatus === "DRAW") {
      return labels.TIE;
    }
    if (gameState.winner === "RED") {
      return labels.RED_WINS;
    }
    if (gameState.winner === "BLACK") {
      return labels.BLACK_WINS;
    }
    return labels.GAME_OVER;
  };
  return (
    <div>
      {gameState.gameStatus === "PLAYING" ? (
        <div 
          className="transition-all duration-500 w-full bg-muted text-foreground rounded-lg p-2"
          role="status"
          aria-label={labels.GAME_TIMING_LABEL}
        >
          <div className="flex items-center gap-2 w-full text-lg">
            <div className="flex items-center gap-2 w-full">
              <Timer className="w-4 h-4" aria-hidden="true" />
              <p aria-label={`${labels.GAME_TIME} ${formatTime(gameTime)}`}>
                {labels.TIME_LABEL} {formatTime(gameTime)}
              </p>
            </div>
            {gameState.turnTimeLimitEnabled && (
              <div className="flex items-center gap-2 w-full">
                <Timer className="w-4 h-4" aria-hidden="true" />
                <p aria-label={`${labels.TURN_TIME_LABEL} ${Math.ceil(gameState.turnTimeRemaining / 1000)} ${labels.SECONDS}`}>
                  {labels.TURN_TIME_LABEL} {Math.ceil(gameState.turnTimeRemaining / 1000)}s
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Button 
          onClick={onShowScoreModal} 
          variant="secondary" 
          size="lg"
          aria-label={`${getResultText()}, ${labels.CLICK_FOR_SCORE}`}
        >
          {getResultText()} - {labels.VIEW_SCORE}
        </Button>
      )}
    </div>
  );
}
