"use client";
import { Board } from "@/components/Board";
import { GameStats } from "@/components/GameStats";
import { useGame } from "@/hooks/useGame";

export default function Home() {
  const { gameState, handleDragEnd, handleDragStart, resetGame, toggleAI, toggleTurnTimeLimit } = useGame();
  return (
    <main className="h-dvh w-full flex items-center justify-center flex-col p-4 md:p-8 overflow-hidden">
      <div className="flex-0 max-w-screen-2xl mx-auto w-full flex flex-col md:flex-row gap-4">
        <div className="flex flex-1 items-top md:items-center justify-center order-2 md:order-1">
          <div className="w-full h-auto aspect-square">
            <Board
              gameState={gameState}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            />
          </div>
        </div>
        <GameStats gameState={gameState} onReset={resetGame} onToggleAI={toggleAI} onToggleTurnTimeLimit={toggleTurnTimeLimit} />
      </div>
    </main>
  );
}
