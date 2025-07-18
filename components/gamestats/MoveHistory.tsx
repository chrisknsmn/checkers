import React from "react";
import { GameState } from "@/types/game";

interface MoveHistoryProps {
  gameState: GameState;
  moveCount: number;
}

export function MoveHistory({ gameState, moveCount }: MoveHistoryProps) {
  return (
    <div 
      className="p-4 rounded-lg bg-muted text-foreground transition-all duration-500 h-full flex-grow overflow-auto hidden md:block"
      role="log"
      aria-label="Move history"
    >
      <div className="flex justify-between mb-3">
        <h2 className="font-semibold">Move History</h2>
        <p aria-label={`Total turns played: ${moveCount}`}>
          Total Turns: {moveCount}
        </p>
      </div>
      <div className="overflow-y-auto space-y-1 text-sm" role="list">
        {gameState.moveHistory.length === 0 ? (
          <div className="italic" role="listitem">No moves yet</div>
        ) : (
          gameState.moveHistory.map((move, index) => {
            const moveTime =
              index > 0
                ? (
                    (move.timestamp -
                      gameState.moveHistory[index - 1].timestamp) /
                    1000
                  ).toFixed(1)
                : (
                    (move.timestamp - (gameState.gameStartTime || 0)) /
                    1000
                  ).toFixed(1);

            return (
              <div
                key={move.id}
                className={`flex justify-between items-center py-1 px-2 rounded ${
                  move.piece.color === "RED" ? "bg-red-100" : "bg-gray-100"
                }`}
                role="listitem"
                aria-label={`Move ${index + 1}: ${move.piece.color.toLowerCase()} piece from ${String.fromCharCode(97 + move.from.col)}${8 - move.from.row} to ${String.fromCharCode(97 + move.to.col)}${8 - move.to.row}${move.type === "CAPTURE" ? " capturing opponent piece" : ""}, took ${moveTime} seconds`}
              >
                <span
                  className={
                    move.piece.color === "RED"
                      ? "text-red-700"
                      : "text-gray-700"
                  }
                >
                  {index + 1}.{" "}
                  <span className="mr-2">
                    {move.piece.color === "RED" ? "RED" : "BLACK"}
                  </span>
                  {String.fromCharCode(97 + move.from.col)}
                  {8 - move.from.row} → {String.fromCharCode(97 + move.to.col)}
                  {8 - move.to.row}
                  {move.type === "CAPTURE" && " (cap)"}
                </span>
                <span className="text-xs">{moveTime}s</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
