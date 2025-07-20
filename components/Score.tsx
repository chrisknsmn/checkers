import React from "react";
import { GameState, GameStats } from "@/types/game";
import { Button } from "@/components/ui/button";
import { labels } from "@/constants/text";

interface ScoreProps {
  gameState: GameState;
  gameStats: GameStats;
  onNewGame: () => void;
  onClose: () => void;
}

export default function Score({
  gameState,
  gameStats,
  onNewGame,
  onClose,
}: ScoreProps) {
  if (gameState.gameStatus === "PLAYING") return null;

  const isDraw = gameState.gameStatus === "DRAW";
  const winner = gameState.winner;
  
  let resultText: string;
  let resultColor: string;

  if (isDraw) {
    resultText = labels.TIE;
    resultColor = "text-gray-600";
  } else if (winner === "RED") {
    resultText = labels.RED_WINS;
    resultColor = "text-red-600";
  } else if (winner === "BLACK") {
    resultText = labels.BLACK_WINS;
    resultColor = "text-gray-800";
  } else {
    resultText = labels.GAME_OVER;
    resultColor = "text-gray-800";
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const renderStatsSection = (
    title: string,
    colorClass: string,
    pieces: number,
    kings: number,
    captured: number
  ) => (
    <>
      <span className={`text-lg font-semibold ${colorClass} col-span-2`}>
        {title}
      </span>
      <span className="font-medium">{labels.REMAINING}</span>
      <span>{pieces}</span>
      <span className="font-medium">{labels.KINGS}</span>
      <span>{kings}</span>
      <span className="font-medium">{labels.CAPTURED}</span>
      <span>{captured}</span>
    </>
  );

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl relative">
        <div className="absolute top-4 right-4">
          <Button onClick={onClose} variant="ghost" size="sm">
            {labels.CLOSE}
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className={`text-3xl font-bold text-center ${resultColor}`}>
            {resultText}
          </h2>

          <div className="grid grid-cols-2 gap-2 text-sm text-left">
            <span className="text-lg font-semibold text-gray-700 col-span-2">
              {labels.STATISTICS}
            </span>
            <span className="font-medium">{labels.GAME_TIME}</span>
            <span className="text-gray-600">
              {formatTime(gameStats.gameTime)}
            </span>
            <span className="font-medium">{labels.TOTAL_MOVES}</span>
            <span className="text-gray-600">{gameStats.totalMoves}</span>

            {renderStatsSection(
              labels.RED,
              "text-red-700",
              gameStats.redPieces,
              gameStats.redKings,
              gameStats.capturedPieces.red.length
            )}
            {renderStatsSection(
              labels.BLACK,
              "text-gray-700",
              gameStats.blackPieces,
              gameStats.blackKings,
              gameStats.capturedPieces.black.length
            )}
          </div>

          <Button onClick={onNewGame} variant="outline">
            {labels.NEW_GAME}
          </Button>
        </div>
      </div>
    </div>
  );
}
