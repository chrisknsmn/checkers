import React from "react";
import { GameState, BorderVariant } from "@/types/game";
import { MoveHistory } from "./MoveHistory";
import { TimingRow } from "./TimingRow";
import { SettingsRow } from "./SettingsRow";
import { PlayerRows } from "./PlayerRows";

interface GameStatsProps {
  gameState: GameState;
  onReset: () => void;
  onToggleAI: (enabled: boolean) => void;
  onToggleTurnTimeLimit: (enabled: boolean) => void;
  onShowScoreModal: () => void;
  checkerBorderVariant: BorderVariant;
  onCheckerBorderVariantChange: (variant: BorderVariant) => void;
}

export function GameStats({
  gameState,
  onReset,
  onToggleAI,
  onToggleTurnTimeLimit,
  onShowScoreModal,
  checkerBorderVariant,
  onCheckerBorderVariantChange,
}: GameStatsProps) {
  const { moveCount, checkers, gameTime } = gameState;

  const redPieces = checkers.filter((c) => c.color === "RED").length;
  const blackPieces = checkers.filter((c) => c.color === "BLACK").length;
  const redKings = checkers.filter((c) => c.color === "RED" && c.isKing).length;
  const blackKings = checkers.filter(
    (c) => c.color === "BLACK" && c.isKing
  ).length;

  return (
    <div className="flex flex-0 md:flex-1 items-center justify-center order-1 md:order-2">
      <div 
        className="flex flex-col gap-4 bg-card rounded-lg p-4 shadow-lg aspect-auto md:aspect-square w-full h-full md:h-auto overflow-hidden"
        role="complementary"
        aria-label="Game statistics and controls"
      >
        <SettingsRow
          gameState={gameState}
          onReset={onReset}
          onToggleAI={onToggleAI}
          onToggleTurnTimeLimit={onToggleTurnTimeLimit}
          checkerBorderVariant={checkerBorderVariant}
          onCheckerBorderVariantChange={onCheckerBorderVariantChange}
        />
        <TimingRow
          gameState={gameState}
          gameTime={gameTime}
          onShowScoreModal={onShowScoreModal}
        />
        <PlayerRows
          gameState={gameState}
          redPieces={redPieces}
          blackPieces={blackPieces}
          redKings={redKings}
          blackKings={blackKings}
        />
        <MoveHistory gameState={gameState} moveCount={moveCount} />
      </div>
    </div>
  );
}
