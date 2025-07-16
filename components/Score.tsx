import React from "react";
import { GameState, GameStats, Player } from "@/types/game";

interface ScoreProps {
  gameState: GameState;
  gameStats: GameStats;
  onNewGame: () => void;
}

export default function Score({ gameState, gameStats, onNewGame }: ScoreProps) {
  if (gameState.gameStatus === "PLAYING") {
    return null;
  }

  const getResultText = () => {
    if (gameState.gameStatus === "DRAW") {
      return "It's a Tie!";
    }

    const winner = gameState.winner;
    if (winner === "RED") {
      return "Red Player Wins!";
    } else if (winner === "BLACK") {
      return "Black Player Wins!";
    }

    return "Game Over";
  };

  const getResultColor = () => {
    if (gameState.gameStatus === "DRAW") {
      return "text-gray-600";
    }

    return gameState.winner === "RED" ? "text-red-600" : "text-gray-800";
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col gap-4">
          <h2 className={`text-3xl font-bold text-center ${getResultColor()}`}>
            {getResultText()}
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
            <div className="text-gray-600">{gameStats.totalMoves}</div>

            <span className="text-lg font-semibold text-red-700 col-span-2">
              Red
            </span>
            <span className="font-medium">Remaining:</span>
            <span>{gameStats.redPieces}</span>
            <span className="font-medium">Kings:</span>
            <span>{gameStats.redKings}</span>
            <span className="font-medium">Captured:</span>
            <span>{gameStats.capturedPieces.red.length}</span>

            <span className="text-lg font-semibold text-gray-700 col-span-2">
              Black
            </span>
            <span className="font-medium">Remaining:</span>
            <span>{gameStats.blackPieces}</span>
            <span className="font-medium">Kings:</span>
            <span>{gameStats.blackKings}</span>
            <span className="font-medium">Captured:</span>
            <span>{gameStats.capturedPieces.red.length}</span>
          </div>

          <button
            onClick={onNewGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 w-full"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
