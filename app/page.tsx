"use client";
import { useState, useEffect } from "react";
import { Board } from "@/components/Board";
import { GameStats } from "@/components/gamestats/GameStats";
import Score from "@/components/Score";
import { useGame } from "@/hooks/useGame";
import { GameStats as GameStatsType, Checker } from "@/types/game";

export default function Home() {
  const { gameState, handleDragEnd, handleDragStart, resetGame, toggleAI, toggleTurnTimeLimit } = useGame();
  const [showScoreModal, setShowScoreModal] = useState(false);
  
  // Show modal when game ends
  useEffect(() => {
    if (gameState.gameStatus !== "PLAYING") {
      setShowScoreModal(true);
    }
  }, [gameState.gameStatus]);
  
  const calculateGameStats = (): GameStatsType => {
    const redPieces = gameState.checkers.filter((c) => c.color === "RED").length;
    const blackPieces = gameState.checkers.filter((c) => c.color === "BLACK").length;
    const redKings = gameState.checkers.filter((c) => c.color === "RED" && c.isKing).length;
    const blackKings = gameState.checkers.filter((c) => c.color === "BLACK" && c.isKing).length;
    
    // Calculate captured pieces from move history
    const capturedRed = gameState.moveHistory.reduce((acc, move) => {
      const redCaptured = move.capturedPieces.filter(piece => piece.color === 'RED');
      return [...acc, ...redCaptured];
    }, [] as Checker[]);
    
    const capturedBlack = gameState.moveHistory.reduce((acc, move) => {
      const blackCaptured = move.capturedPieces.filter(piece => piece.color === 'BLACK');
      return [...acc, ...blackCaptured];
    }, [] as Checker[]);
    
    return {
      redPieces,
      blackPieces,
      redKings,
      blackKings,
      totalMoves: gameState.moveCount,
      gameTime: gameState.gameTime,
      capturedPieces: {
        red: capturedRed,
        black: capturedBlack
      }
    };
  };
  
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
        <GameStats 
          gameState={gameState} 
          onReset={resetGame} 
          onToggleAI={toggleAI} 
          onToggleTurnTimeLimit={toggleTurnTimeLimit}
          onShowScoreModal={() => setShowScoreModal(true)}
        />
      </div>
      
      {showScoreModal && (
        <Score 
          gameState={gameState}
          gameStats={calculateGameStats()}
          onNewGame={() => {
            resetGame();
            setShowScoreModal(true);
          }}
          onClose={() => setShowScoreModal(false)}
        />
      )}
    </main>
  );
}
