import React from "react";
import { GameState } from "@/types/game";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RotateCcw, Settings, Timer } from "lucide-react";

interface GameStatsProps {
  gameState: GameState;
  onReset: () => void;
  onToggleAI: (enabled: boolean) => void;
  onToggleTurnTimeLimit: (enabled: boolean) => void;
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function GameStats({
  gameState,
  onReset,
  onToggleAI,
  onToggleTurnTimeLimit,
}: GameStatsProps) {
  const { currentPlayer, moveCount, checkers, gameTime } = gameState;

  const redPieces = checkers.filter((c) => c.color === "RED").length;
  const blackPieces = checkers.filter((c) => c.color === "BLACK").length;
  const redKings = checkers.filter((c) => c.color === "RED" && c.isKing).length;
  const blackKings = checkers.filter(
    (c) => c.color === "BLACK" && c.isKing
  ).length;

  return (
    <div className="flex flex-0 md:flex-1 items-center justify-center order-1 md:order-2">
      <div className="flex flex-col gap-4 bg-white rounded-xl p-4 shadow-lg aspect-auto md:aspect-square w-full h-full md:h-auto overflow-hidden">
        <div className="flex">
          <h2 className="text-4xl font-bold text-gray-600 flex-1">Checkers</h2>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onReset} aria-label="reset game">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" aria-label="settings">
                  <Settings className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end" side="bottom">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="grid items-center gap-1">
                      <label className="text-sm font-medium">Game Mode</label>
                      <div className="w-full">
                        <div className="flex items-center bg-gray-200 rounded-full p-1 w-full">
                          <button
                            type="button"
                            className={`cursor-pointer w-full px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              gameState.isAIEnabled
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                            onClick={() => onToggleAI(true)}
                          >
                            Play AI
                          </button>
                          <button
                            type="button"
                            className={`cursor-pointer w-full px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              !gameState.isAIEnabled
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                            onClick={() => onToggleAI(false)}
                          >
                            2 Player
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid items-center gap-1">
                      <label className="text-sm font-medium">Time Limit</label>
                      <div>
                        <div className="flex items-center bg-gray-200 rounded-full p-1 w-full">
                          <button
                            type="button"
                            className={`cursor-pointer w-full px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              !gameState.turnTimeLimitEnabled
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                            onClick={() => onToggleTurnTimeLimit(false)}
                          >
                            Off
                          </button>
                          <button
                            type="button"
                            className={`cursor-pointer w-full px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              gameState.turnTimeLimitEnabled
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                            onClick={() => onToggleTurnTimeLimit(true)}
                          >
                            On
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="hidden md:flex flex-col gap-2">
          <div className="transition-all duration-500 w-full bg-gray-100 rounded-xl p-3">
            <div className="flex items-center gap-2 w-full">
              <Timer className="w-4 h-4 text-gray-600" />
              <p className="text-gray-600">Time: {formatTime(gameTime)}</p>
            </div>
          </div>
          {gameState.turnTimeLimitEnabled && (
            <div className="transition-all duration-500 w-full bg-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-2 w-full">
                <Timer className="w-4 h-4 text-gray-600" />
                <p className="text-gray-600">
                  Turn Time: {Math.ceil(gameState.turnTimeRemaining / 1000)}s
                </p>
              </div>
            </div>
          )}
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
            <h3 className="font-semibold text-gray-800 flex-grow w-12">
              BLACK
            </h3>
            <p className="flex-grow">Pieces: {blackPieces}</p>
            <p className="flex-grow">Kings: {blackKings}</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-gray-100 transition-all duration-500 border-4 h-full flex-grow overflow-auto hidden md:block">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold text-gray-600">Move History</h3>{" "}
            <p className="text-gray-600">Total Turns: {moveCount}</p>
          </div>
          <div className=" overflow-y-auto space-y-1 text-sm">
            {gameState.moveHistory.length === 0 ? (
              <p className="text-gray-500 italic">No moves yet</p>
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
                      <span className="mr-2">
                        {move.piece.color === "RED" ? "RED" : "BLACK"}
                      </span>
                      {String.fromCharCode(97 + move.from.col)}
                      {8 - move.from.row} →{" "}
                      {String.fromCharCode(97 + move.to.col)}
                      {8 - move.to.row}
                      {move.type === "CAPTURE" && " (cap)"}
                    </span>
                    <span className="text-gray-500 text-xs">{moveTime}s</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
