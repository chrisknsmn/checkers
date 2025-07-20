import React from "react";
import { GameState, GameStats } from "@/types/game";
import { Button } from "@/components/ui/button";

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
    resultText = "It's a Tie!";
    resultColor = "text-gray-600";
  } else if (winner === "RED") {
    resultText = "Red Wins!";
    resultColor = "text-red-600";
  } else if (winner === "BLACK") {
    resultText = "Black Wins!";
    resultColor = "text-gray-800";
  } else {
    resultText = "Game Over";
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
      <span className="font-medium">Remaining:</span>
      <span>{pieces}</span>
      <span className="font-medium">Kings:</span>
      <span>{kings}</span>
      <span className="font-medium">Captured:</span>
      <span>{captured}</span>
    </>
  );

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl relative">
        <div className="absolute top-4 right-4">
          <Button onClick={onClose} variant="ghost" size="sm">
            ✕
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className={`text-3xl font-bold text-center ${resultColor}`}>
            {resultText}
          </h2>

          <div className="grid grid-cols-2 gap-2 text-sm text-left">
            <span className="text-lg font-semibold text-gray-700 col-span-2">
              Statistics
            </span>
            <span className="font-medium">Game Time:</span>
            <span className="text-gray-600">
              {formatTime(gameStats.gameTime)}
            </span>
            <span className="font-medium">Total Moves:</span>
            <span className="text-gray-600">{gameStats.totalMoves}</span>

            {renderStatsSection(
              "Red",
              "text-red-700",
              gameStats.redPieces,
              gameStats.redKings,
              gameStats.capturedPieces.red.length
            )}
            {renderStatsSection(
              "Black",
              "text-gray-700",
              gameStats.blackPieces,
              gameStats.blackKings,
              gameStats.capturedPieces.black.length
            )}
          </div>

          <Button onClick={onNewGame} variant="outline">
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
}
