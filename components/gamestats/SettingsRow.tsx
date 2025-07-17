import React from "react";
import { GameState } from "@/types/game";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RotateCcw, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface SettingsRowProps {
  gameState: GameState;
  onReset: () => void;
  onToggleAI: (enabled: boolean) => void;
  onToggleTurnTimeLimit: (enabled: boolean) => void;
}

function ToggleOption<T extends string>({
  options,
  value,
  onChange,
  icons,
}: {
  options: T[];
  value: T;
  onChange: (val: T) => void;
  icons?: Record<T, React.ReactNode>;
}) {
  return (
    <div className="flex items-center bg-background rounded-full p-1 w-full">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`cursor-pointer w-full px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
            value === opt
              ? "bg-card text-card-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onChange(opt)}
        >
          {icons?.[opt]}
          {opt}
        </button>
      ))}
    </div>
  );
}

export function SettingsRow({
  gameState,
  onReset,
  onToggleAI,
  onToggleTurnTimeLimit,
}: SettingsRowProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-4xl font-bold text-foreground">Checkers</h2>
      <div className="flex gap-4">
        <Button variant="outline" onClick={onReset} aria-label="Reset Game">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" aria-label="Settings">
              <Settings className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end" side="bottom">
            <div className="grid gap-4">
              {/* Theme */}
              <div className="grid gap-1">
                <label className="text-sm font-medium">Theme</label>
                <ToggleOption
                  options={["light", "dark"]}
                  value={theme}
                  onChange={toggleTheme}
                  icons={{
                    light: <Sun className="w-3 h-3" />,
                    dark: <Moon className="w-3 h-3" />,
                  }}
                />
              </div>
              {/* Game Mode */}
              <div className="grid gap-1">
                <label className="text-sm font-medium">Game Mode</label>
                <ToggleOption
                  options={["AI", "2P"]}
                  value={gameState.isAIEnabled ? "AI" : "2P"}
                  onChange={(val) => onToggleAI(val === "AI")}
                />
              </div>
              {/* Time Limit */}
              <div className="grid gap-1">
                <label className="text-sm font-medium">Time Limit</label>
                <ToggleOption
                  options={["Off", "On"]}
                  value={gameState.turnTimeLimitEnabled ? "On" : "Off"}
                  onChange={(val) => onToggleTurnTimeLimit(val === "On")}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
