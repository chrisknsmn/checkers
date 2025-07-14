"use client";
import { Board } from "@/components/Board";
import { GameStats } from "@/components/GameStats";
import { useGame } from "@/hooks/useGame";

export default function Home() {
  const { gameState, handleCellClick, handleDragEnd, resetGame } = useGame();
  return (
    <main className="h-dvh w-full flex flex-col p-4 md:p-8 overflow-hidden b">
      <div className="flex-1 max-w-screen-2xl mx-auto w-full flex flex-col md:flex-row gap-4 b">
        <div className="flex flex-1 items-center justify-center order-2 md:order-1 b">
          <div className="w-full h-auto aspect-square b">
            <Board
              gameState={gameState}
              onCellClick={handleCellClick}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center order-1 md:order-2 b">
          <div className="flex flex-col gap-4 bg-white rounded-xl p-4 shadow-lg aspect-auto md:aspect-square w-full h-auto b">
            <GameStats gameState={gameState} onReset={resetGame} />
          </div>
        </div>
      </div>
    </main>
  );
}
