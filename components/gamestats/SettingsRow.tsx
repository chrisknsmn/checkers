import React from "react";
import { GameState } from "@/types/game";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RotateCcw, Settings } from "lucide-react";

interface SettingsRowProps {
  gameState: GameState;
  onReset: () => void;
  onToggleAI: (enabled: boolean) => void;
  onToggleTurnTimeLimit: (enabled: boolean) => void;
}

export function SettingsRow({
  gameState,
  onReset,
  onToggleAI,
  onToggleTurnTimeLimit,
}: SettingsRowProps) {
  return (
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
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}