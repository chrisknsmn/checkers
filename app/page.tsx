"use client";
import { Board } from "@/components/Board";
import { GameStats } from "@/components/GameStats";
import { useGame } from "@/hooks/useGame";

export default function Home() {
  const { gameState, handleCellClick, handleDragEnd, resetGame } = useGame();
  return (
    <main className="h-dvh w-full flex items-center justify-center flex-col p-4 md:p-8 overflow-hidden">
      <div className="flex-0 max-w-screen-2xl mx-auto w-full flex flex-col md:flex-row gap-4">
        <div className="flex flex-1 items-top md:items-center justify-center order-2 md:order-1">
          <div className="w-full h-auto aspect-square">
            <Board
              gameState={gameState}
              onCellClick={handleCellClick}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>
        <div className="flex flex-0 md:flex-1 items-center justify-center order-1 md:order-2">
          <div className="flex flex-col gap-4 bg-white rounded-xl p-4 shadow-lg aspect-auto md:aspect-square w-full h-full md:h-auto">
            <GameStats gameState={gameState} onReset={resetGame} />
          </div>
        </div>
      </div>
    </main>
  );
}
