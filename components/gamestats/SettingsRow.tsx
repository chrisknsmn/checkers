import React from "react";
import { GameState, BorderVariant } from "@/types/game";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RotateCcw, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { labels } from "@/constants/text";

interface SettingsRowProps {
  gameState: GameState;
  onReset: () => void;
  onToggleAI: (enabled: boolean) => void;
  onToggleTurnTimeLimit: (enabled: boolean) => void;
  checkerBorderVariant: BorderVariant;
  onCheckerBorderVariantChange: (variant: BorderVariant) => void;
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
    <div
      className="flex items-center bg-popover rounded-full p-1 w-full"
      role="group"
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`cursor-pointer w-full px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
            value === opt
              ? "bg-background text-card-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
          aria-label={`Select ${opt}`}
        >
          {icons?.[opt] && <span aria-hidden="true">{icons[opt]}</span>}
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
  checkerBorderVariant,
  onCheckerBorderVariantChange,
}: SettingsRowProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-4xl font-bold text-foreground">{labels.CHECKERS_TITLE}</h1>
      <div className="flex gap-4">
        <Button variant="outline" onClick={onReset} aria-label={labels.RESET_GAME}>
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" aria-label={labels.OPEN_SETTINGS}>
              <Settings className="w-4 h-4" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80"
            align="end"
            side="bottom"
            role="dialog"
            aria-label={labels.GAME_SETTINGS}
          >
            <div className="grid gap-4">
              {/* Theme */}
              <div className="grid gap-1">
                <label className="text-sm font-medium" id="theme-label">
                  {labels.THEME}
                </label>
                <div role="group" aria-labelledby="theme-label">
                  <ToggleOption
                    options={[labels.LIGHT, labels.DARK]}
                    value={theme}
                    onChange={toggleTheme}
                    icons={{
                      light: <Sun className="w-3 h-3" />,
                      dark: <Moon className="w-3 h-3" />,
                    }}
                  />
                </div>
              </div>
              {/* Game Mode */}
              <div className="grid gap-1">
                <label className="text-sm font-medium" id="gamemode-label">
                  {labels.GAME_MODE}
                </label>
                <div role="group" aria-labelledby="gamemode-label">
                  <ToggleOption
                    options={[labels.AI, labels.TWO_PLAYER]}
                    value={gameState.isAIEnabled ? labels.AI : labels.TWO_PLAYER}
                    onChange={(val) => onToggleAI(val === labels.AI)}
                  />
                </div>
              </div>
              {/* Time Limit */}
              <div className="grid gap-1">
                <label className="text-sm font-medium" id="timelimit-label">
                  {labels.TIME_LIMIT}
                </label>
                <div role="group" aria-labelledby="timelimit-label">
                  <ToggleOption
                    options={[labels.OFF, labels.ON]}
                    value={gameState.turnTimeLimitEnabled ? labels.ON : labels.OFF}
                    onChange={(val) => onToggleTurnTimeLimit(val === labels.ON)}
                  />
                </div>
              </div>
              {/* Checker Border Style */}
              <div className="grid gap-1">
                <label className="text-sm font-medium" id="border-label">
                  {labels.CHECKER_BORDER_STYLE}
                </label>
                <div role="group" aria-labelledby="border-label">
                  <ToggleOption
                    options={["default", "solid", "dashed", "none"]}
                    value={checkerBorderVariant}
                    onChange={onCheckerBorderVariantChange}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
