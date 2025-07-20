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
          <div className="italic" role="listitem">
            No moves yet
          </div>
        ) : (
          gameState.moveHistory.map((move, i) => {
            // Get the previous timestamp (either from the previous move or game start)
            let prevTime = 0;
            if (i > 0) {
              prevTime = gameState.moveHistory[i - 1].timestamp;
            } else if (gameState.gameStartTime) {
              prevTime = gameState.gameStartTime;
            }

            // Calculate time delta between moves
            const time = ((move.timestamp - prevTime) / 1000).toFixed(1);

            // Format board positions (e.g., a3 → b4)
            const fromCol = String.fromCharCode(97 + move.from.col);
            const fromRow = 8 - move.from.row;
            const toCol = String.fromCharCode(97 + move.to.col);
            const toRow = 8 - move.to.row;

            const from = `${fromCol}${fromRow}`;
            const to = `${toCol}${toRow}`;

            // Determine piece color and associated styles
            let isRed = false;
            if (move.piece.color === "RED") {
              isRed = true;
            }

            const bgClass = isRed ? "bg-red-100" : "bg-gray-100";
            const textClass = isRed ? "text-red-700" : "text-gray-700";
            const labelColor = isRed ? "red" : "black";

            // Build aria label
            let ariaLabel = `Move ${i + 1}: ${labelColor} ${from} to ${to}`;
            if (move.type === "CAPTURE") {
              ariaLabel += ", capturing piece";
            }
            ariaLabel += `, took ${time} seconds`;

            return (
              <div
                key={move.id}
                className={`flex justify-between items-center py-1 px-2 rounded ${bgClass}`}
                role="listitem"
                aria-label={ariaLabel}
              >
                <span className={textClass}>
                  {i + 1}.{" "}
                  <span className="mr-2">{labelColor.toUpperCase()}</span>
                  {from} → {to}
                  {move.type === "CAPTURE" && " (cap)"}
                </span>
                <span className="text-xs">{time}s</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
