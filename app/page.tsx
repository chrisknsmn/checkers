"use client";
import { Board } from "@/components/Board";
import { GameStats } from "@/components/GameStats";
import { useGame } from "@/hooks/useGame";

export default function Home() {
  const { gameState, handleCellClick, handleDragEnd, resetGame } = useGame();
  return (
    <main className="min-h-screen w-full p-4 md:p-8">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-4 md:gap-8 min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] b">
        <div className="flex-1 flex items-start md:items-center justify-center order-2 md:order-1">
          <div className="w-full max-w-md md:max-w-none aspect-square">
            <Board
              gameState={gameState}
              onCellClick={handleCellClick}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>
        <div className="flex-0 md:flex-1 flex items-center justify-center order-1 md:order-2">
          <GameStats gameState={gameState} onReset={resetGame} />
        </div>
      </div>
    </main>
  );
}
