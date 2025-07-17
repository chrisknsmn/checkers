import React from "react";
import { GameState } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

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
      return "It's a Tie!";
    }
    if (gameState.winner === "RED") {
      return "Red Wins!";
    }
    if (gameState.winner === "BLACK") {
      return "Black Wins!";
    }
    return "Game Over";
  };

  return (
    <div>
      {gameState.gameStatus === "PLAYING" ? (
        <div className="transition-all duration-500 w-full bg-muted text-foreground rounded-xl p-2">
          <div className="flex items-center gap-2 w-full text-lg">
            <div className="flex items-center gap-2 w-full">
              <Timer className="w-4 h-4" />
              <p>Time: {formatTime(gameTime)}</p>
            </div>
            {gameState.turnTimeLimitEnabled && (
              <div className="flex items-center gap-2 w-full">
                <Timer className="w-4 h-4" />
                <p>
                  Turn Time: {Math.ceil(gameState.turnTimeRemaining / 1000)}s
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Button onClick={onShowScoreModal} variant="secondary" size="lg">
          {getResultText()} - View Score
        </Button>
      )}
    </div>
  );
}
