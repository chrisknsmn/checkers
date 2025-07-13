import React from "react";
import { GameState, Position } from "@/types/game";
import { Checker } from "./Checker";
import { cn } from "@/lib/utils";

interface BoardProps {
  gameState: GameState;
  onCellClick: (position: Position) => void;
}

export function Board({ gameState, onCellClick }: BoardProps) {
  const { board, selectedPiece } = gameState;
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-auto h-full md:w-full aspect-square">
        <div className="grid grid-cols-8 gap-1 p-2 bg-gray-400 w-full h-full rounded-xl">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected =
                selectedPiece?.row === rowIndex &&
                selectedPiece?.col === colIndex;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "board-square rounded-lg",
                    "w-full aspect-square flex items-center justify-center cursor-pointer transition-all duration-150",
                    "relative",
                    {
                      "bg-gray-50":
                        !cell.isDark && !cell.isValidMove && !isSelected,
                      "bg-gray-200":
                        cell.isDark && !cell.isValidMove && !isSelected,
                      "bg-green-300": isSelected || cell.isValidMove,
                      "hover:bg-green-200":
                        (!cell.isDark && !cell.isValidMove && !isSelected) ||
                        (cell.isDark && !cell.isValidMove && !isSelected) ||
                        isSelected,
                    }
                  )}
                  onClick={() => onCellClick(cell.position)}
                  data-testid={`board-square-${rowIndex}-${colIndex}`}
                >
                  {cell.checker && (
                    <Checker
                      piece={cell.checker}
                      isSelected={isSelected}
                      onClick={() => onCellClick(cell.position)}
                    />
                  )}

                  {cell.isValidMove && !cell.checker && (
                    <div className="w-4 h-4 bg-green-400 rounded-full opacity-80" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
