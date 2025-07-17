import React from "react";
import { GameState } from "@/types/game";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PlayerRowsProps {
  gameState: GameState;
  redPieces: number;
  blackPieces: number;
  redKings: number;
  blackKings: number;
}

export function PlayerRows({
  gameState,
  redPieces,
  blackPieces,
  redKings,
  blackKings,
}: PlayerRowsProps) {
  const { currentPlayer } = gameState;

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`p-4 border-4 rounded-xl transition-all duration-500 flex flex-1 text-center ${
              currentPlayer === "RED" ? "border-red-500" : "border-transparent"
            }`}
          >
            <h3 className="font-semibold text-red-500 flex-grow w-12">RED</h3>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start" side="bottom">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">RED</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Pieces:</span> {redPieces}
              </div>
              <div>
                <span className="font-medium">Kings:</span> {redKings}
              </div>
            </div>
            <div className="md:hidden">
              <h4 className="font-medium mb-2">Move History</h4>
              <div className="h-48 overflow-y-auto space-y-1 text-sm">
                {gameState.moveHistory.length === 0 ? (
                  <p className="text-gray-500 italic">No moves yet</p>
                ) : (
                  gameState.moveHistory.map((move, index) => (
                    <div
                      key={move.id}
                      className={`flex justify-between items-center py-1 px-2 rounded ${
                        move.piece.color === "RED" ? "bg-red-50" : "bg-gray-50"
                      }`}
                    >
                      <span
                        className={
                          move.piece.color === "RED"
                            ? "text-red-700"
                            : "text-gray-700"
                        }
                      >
                        {index + 1}.{" "}
                        {move.piece.color === "RED" ? "RED" : "BLACK"}{" "}
                        {String.fromCharCode(97 + move.from.col)}
                        {8 - move.from.row} →{" "}
                        {String.fromCharCode(97 + move.to.col)}
                        {8 - move.to.row}
                        {move.type === "CAPTURE" && " (cap)"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`p-4 border-4 rounded-xl transition-all duration-500 flex flex-1 text-center ${
              currentPlayer === "RED" ? "border-transparent" : "border-red-500"
            }`}
          >
            <h3 className="font-semibold text-foreground flex-grow w-12">
              BLACK
            </h3>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end" side="bottom">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">BLACK</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Pieces:</span> {blackPieces}
              </div>
              <div>
                <span className="font-medium">Kings:</span> {blackKings}
              </div>
            </div>
            <div className="md:hidden">
              <h4 className="font-medium mb-2">Move History</h4>
              <div className="h-48 overflow-y-auto space-y-1 text-sm">
                {gameState.moveHistory.length === 0 ? (
                  <p className="text-gray-500 italic">No moves yet</p>
                ) : (
                  gameState.moveHistory.map((move, index) => (
                    <div
                      key={move.id}
                      className={`flex justify-between items-center py-1 px-2 rounded ${
                        move.piece.color === "RED" ? "bg-red-50" : "bg-gray-50"
                      }`}
                    >
                      <span
                        className={
                          move.piece.color === "RED"
                            ? "text-red-700"
                            : "text-gray-700"
                        }
                      >
                        {index + 1}.{" "}
                        {move.piece.color === "RED" ? "RED" : "BLACK"}{" "}
                        {String.fromCharCode(97 + move.from.col)}
                        {8 - move.from.row} →{" "}
                        {String.fromCharCode(97 + move.to.col)}
                        {8 - move.to.row}
                        {move.type === "CAPTURE" && " (cap)"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
