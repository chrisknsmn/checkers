"use client";
import { Board } from "@/components/Board";
import { GameStats } from "@/components/GameStats";
import { useGame } from "@/hooks/useGame";

export default function Home() {
  const { gameState, handleCellClick, resetGame } = useGame();
  return (
    <main className="h-screen w-full p-8">
      <div className="h-full max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex items-start md:items-center justify-center order-2 md:order-1">
          <div className="w-full aspect-square">
            <Board gameState={gameState} onCellClick={handleCellClick} />
          </div>
        </div>
        <div className="flex-0 md:flex-1 flex items-center justify-center order-1 md:order-2 min-h-1/3">
          <div className="w-full aspect-auto md:aspect-square h-full md:h-auto">
            <GameStats gameState={gameState} onReset={resetGame} />
          </div>
        </div>
      </div>
    </main>
  );
}
