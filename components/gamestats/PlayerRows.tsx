import React from "react";
import { GameState } from "@/types/game";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { labels } from "@/constants/text";

interface PlayerRowsProps {
  gameState: GameState;
  redPieces: number;
  blackPieces: number;
  redKings: number;
  blackKings: number;
}

const players = [
  {
    label: labels.BLACK,
    textColor: "text-foreground",
    pieceCountKey: "blackPieces",
    kingCountKey: "blackKings",
    borderColor: "border-red-500",
    textShade: "text-gray-700",
    bgColor: "bg-gray-50",
    align: "end",
  },
  {
    label: labels.RED,
    textColor: "text-foreground",
    pieceCountKey: "redPieces",
    kingCountKey: "redKings",
    borderColor: "border-red-500",
    textShade: "text-gray-700",
    bgColor: "bg-red-50",
    align: "start",
  },
];

export function PlayerRows({
  gameState,
  redPieces,
  blackPieces,
  redKings,
  blackKings,
}: PlayerRowsProps) {
  const { currentPlayer, moveHistory } = gameState;

  const pieceCounts: Record<string, number> = {
    redPieces,
    blackPieces,
    redKings,
    blackKings,
  };

  return (
    <div
      className="flex gap-2"
      role="group"
      aria-label={labels.PLAYER_INFO_LABEL}
    >
      {players.map((player) => {
        const isCurrent = currentPlayer === player.label.toUpperCase();
        const pieceKey = player.label.toLowerCase() + "Pieces";
        const kingKey = player.label.toLowerCase() + "Kings";

        return (
          <Popover key={player.label}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`p-4 border-4 rounded-lg transition-all duration-300 flex flex-1 text-center ${
                  isCurrent ? "border-red-500 bg-red-50/50" : "border-border"
                }`}
                aria-label={`${player.label} player: ${pieceCounts[pieceKey]} ${
                  labels.PIECES_COUNT
                }, ${pieceCounts[kingKey]} ${labels.KINGS_COUNT}${
                  isCurrent ? `, ${labels.CURRENT_TURN}` : ""
                }`}
                aria-pressed={isCurrent}
              >
                <div
                  className={`font-semibold ${player.textColor} flex-grow w-12`}
                >
                  {player.label}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="center" side="bottom">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-lg">{player.label}</h2>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">{labels.PIECES}</span>{" "}
                    {pieceCounts[pieceKey]}
                  </div>
                  <div>
                    <span className="font-medium">{labels.KINGS}</span>{" "}
                    {pieceCounts[kingKey]}
                  </div>
                </div>
                <div className="md:hidden">
                  <h3 className="font-medium mb-2">{labels.MOVE_HISTORY}</h3>
                  <div className="h-48 overflow-y-auto space-y-1 text-sm">
                    {moveHistory.length === 0 ? (
                      <p className="text-gray-500 italic">{labels.NO_MOVES}</p>
                    ) : (
                      moveHistory.map((move, index) => (
                        <div
                          key={move.id}
                          className={`flex justify-between items-center py-1 px-2 rounded ${
                            move.piece.color === "RED"
                              ? players[0].bgColor
                              : players[1].bgColor
                          }`}
                        >
                          <span
                            className={
                              move.piece.color === "RED"
                                ? players[0].textShade
                                : players[1].textShade
                            }
                          >
                            {index + 1}. {move.piece.color}{" "}
                            {String.fromCharCode(97 + move.from.col)}
                            {8 - move.from.row} →{" "}
                            {String.fromCharCode(97 + move.to.col)}
                            {8 - move.to.row}
                            {move.type === "CAPTURE" &&
                              ` ${labels.CAPTURE_INDICATOR}`}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
