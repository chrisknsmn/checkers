import React from "react";
import { GameState } from "@/types/game";
import { Button } from "@/components/ui/button";
import { RotateCcw, Settings } from "lucide-react";

interface GameStatsProps {
  gameState: GameState;
  onReset: () => void;
}

export function GameStats({ gameState, onReset }: GameStatsProps) {
  const { currentPlayer, moveCount, checkers } = gameState;

  const redPieces = checkers.filter((c) => c.color === "RED").length;
  const blackPieces = checkers.filter((c) => c.color === "BLACK").length;
  const redKings = checkers.filter((c) => c.color === "RED" && c.isKing).length;
  const blackKings = checkers.filter(
    (c) => c.color === "BLACK" && c.isKing
  ).length;

  return (
    <>
      <div className="flex">
        <h2 className="text-4xl font-bold text-gray-600 flex-1">Checkers</h2>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onReset} aria-label="reset game">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" aria-label="settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-gray-100 transition-all duration-500">
        <p className="text-gray-600">Total Turns: {moveCount}</p>
      </div>
      <div
        className={`p-2 border-4 rounded-xl bg-gray-100 transition-all duration-500 flex ${
          currentPlayer === "RED" ? "border-red-500" : "border-transparent"
        }`}
      >
        <h3 className="font-semibold text-red-500 flex-grow w-12">RED</h3>
        <p className="flex-grow">Pieces: {redPieces}</p>
        <p className="flex-grow">Kings: {redKings}</p>
      </div>
      <div
        className={`p-2 border-4 rounded-xl bg-gray-100 transition-all duration-500 flex ${
          currentPlayer === "RED" ? "border-transparent" : "border-red-500"
        }`}
      >
        <h3 className="font-semibold text-gray-800 flex-grow w-12">BLACK</h3>
        <p className="flex-grow">Pieces: {blackPieces}</p>
        <p className="flex-grow">Kings: {blackKings}</p>
      </div>
    </>
  );
}
