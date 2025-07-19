"use client";
import { useState, useEffect } from "react";
import { Board } from "@/components/Board";
import { GameStats } from "@/components/gamestats/GameStats";
import Score from "@/components/Score";
import { useGame } from "@/hooks/useGame";
import { GameStats as GameStatsType, Checker, BorderVariant } from "@/types/game";

export default function Home() {
  const {
    gameState,
    handleDragEnd,
    handleDragStart,
    resetGame,
    toggleAI,
    toggleTurnTimeLimit,
  } = useGame();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [checkerBorderVariant, setCheckerBorderVariant] = useState<BorderVariant>("default");

  // Show modal when game ends
  useEffect(() => {
    if (gameState.gameStatus !== "PLAYING") {
      setShowScoreModal(true);
    }
  }, [gameState.gameStatus]);

  // Add announcements for game state changes
  useEffect(() => {
    const newAnnouncements: string[] = [];

    if (gameState.gameStatus === "PLAYING") {
      newAnnouncements.push(
        `${gameState.currentPlayer.toLowerCase()} player's turn`
      );
    } else if (gameState.gameStatus === "RED_WINS") {
      newAnnouncements.push("Game over! Red player wins!");
    } else if (gameState.gameStatus === "BLACK_WINS") {
      newAnnouncements.push("Game over! Black player wins!");
    } else if (gameState.gameStatus === "DRAW") {
      newAnnouncements.push("Game over! It's a draw!");
    }

    setAnnouncements(newAnnouncements);
  }, [gameState.currentPlayer, gameState.gameStatus, gameState.winner]);

  // Announce moves
  useEffect(() => {
    if (gameState.moveHistory.length > 0) {
      const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
      const fromPos = `${String.fromCharCode(97 + lastMove.from.col)}${
        8 - lastMove.from.row
      }`;
      const toPos = `${String.fromCharCode(97 + lastMove.to.col)}${
        8 - lastMove.to.row
      }`;
      const moveAnnouncement = `${lastMove.piece.color.toLowerCase()} piece moved from ${fromPos} to ${toPos}${
        lastMove.type === "CAPTURE" ? " and captured opponent piece" : ""
      }`;

      setAnnouncements((prev) => [...prev, moveAnnouncement]);
    }
  }, [gameState.moveHistory]);

  const calculateGameStats = (): GameStatsType => {
    const redPieces = gameState.checkers.filter(
      (c) => c.color === "RED"
    ).length;
    const blackPieces = gameState.checkers.filter(
      (c) => c.color === "BLACK"
    ).length;
    const redKings = gameState.checkers.filter(
      (c) => c.color === "RED" && c.isKing
    ).length;
    const blackKings = gameState.checkers.filter(
      (c) => c.color === "BLACK" && c.isKing
    ).length;

    // Calculate captured pieces from move history
    const capturedRed = gameState.moveHistory.reduce((acc, move) => {
      const redCaptured = move.capturedPieces.filter(
        (piece) => piece.color === "RED"
      );
      return [...acc, ...redCaptured];
    }, [] as Checker[]);

    const capturedBlack = gameState.moveHistory.reduce((acc, move) => {
      const blackCaptured = move.capturedPieces.filter(
        (piece) => piece.color === "BLACK"
      );
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
        black: capturedBlack,
      },
    };
  };

  return (
    <main className="h-dvh w-full flex items-center justify-center flex-col p-4 md:p-8 overflow-hidden">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcements.map((announcement, index) => (
          <div key={`${announcement}-${index}`}>{announcement}</div>
        ))}
      </div>

      <div className="flex-0 mx-auto w-full flex flex-col md:flex-row gap-4 md:max-w-screen-2xl max-w-[640px]">
        <div className="flex flex-1 items-top md:items-center justify-center order-2 md:order-1">
          <div className="w-full h-auto aspect-square">
            <Board
              gameState={gameState}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              borderVariant={checkerBorderVariant}
            />
          </div>
        </div>
        <GameStats
          gameState={gameState}
          onReset={resetGame}
          onToggleAI={toggleAI}
          onToggleTurnTimeLimit={toggleTurnTimeLimit}
          onShowScoreModal={() => setShowScoreModal(true)}
          checkerBorderVariant={checkerBorderVariant}
          onCheckerBorderVariantChange={setCheckerBorderVariant}
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
