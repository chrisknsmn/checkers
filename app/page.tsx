"use client";

// React imports for state management and lifecycle hooks
import { useState, useEffect } from "react";

// Component imports for the game interface
import { Board } from "@/components/Board";
import { GameStats } from "@/components/gamestats/GameStats";
import { StartGameCard } from "@/components/StartGameCard";
import Score from "@/components/Score";

// Custom hook for game logic and state management
import { useGame } from "@/hooks/useGame";

// Type definitions for TypeScript support
import {
  GameStats as GameStatsType,
  Checker,
  BorderVariant,
} from "@/types/game";

// Text constants for user interface labels
import { labels } from "@/constants/text";

/**
 * Home component - Main page component that renders the checkers game
 * This is the primary game interface that manages all game interactions,
 * displays the board, handles user input, and shows game statistics
 */
export default function Home() {
  // Destructure game logic and state from the useGame hook
  // This hook provides all the necessary functions and state for game management
  const {
    gameState, // Current state of the game (board, pieces, status, etc.)
    selectPiece, // Function to select a piece on the board
    makeMove, // Function to execute a move
    handleDragEnd, // Handler for when piece dragging ends
    handleDragStart, // Handler for when piece dragging starts
    resetGame, // Function to reset the game to initial state
    toggleAI, // Function to toggle AI opponent on/off
    toggleTurnTimeLimit, // Function to toggle turn time limits
    startGame, // Function to start a new game
  } = useGame();

  // Local state for UI components
  const [showScoreModal, setShowScoreModal] = useState(false); // Controls score modal visibility
  const [announcements, setAnnouncements] = useState<string[]>([]); // Screen reader announcements for accessibility
  const [checkerBorderVariant, setCheckerBorderVariant] =
    useState<BorderVariant>("solid"); // Visual style for checker borders

  /**
   * Effect to show score modal when game ends
   * Monitors game status and displays the score modal whenever the game is no longer in "PLAYING" state
   */
  useEffect(() => {
    if (gameState.gameStatus !== "PLAYING") {
      setShowScoreModal(true);
    }
  }, [gameState.gameStatus]);

  /**
   * Effect to manage accessibility announcements for game state changes
   * Creates screen reader announcements for current player turns and game outcomes
   * This helps visually impaired users understand what's happening in the game
   */
  useEffect(() => {
    const newAnnouncements: string[] = [];

    // Announce whose turn it is during active gameplay
    if (gameState.gameStatus === "PLAYING") {
      newAnnouncements.push(
        `${gameState.currentPlayer.toLowerCase()} ${labels.PLAYER_TURN}`
      );
    } else if (gameState.gameStatus === "RED_WINS") {
      newAnnouncements.push(labels.RED_WINS_MESSAGE);
    } else if (gameState.gameStatus === "BLACK_WINS") {
      newAnnouncements.push(labels.BLACK_WINS_MESSAGE);
    } else if (gameState.gameStatus === "DRAW") {
      newAnnouncements.push(labels.DRAW_MESSAGE);
    }

    setAnnouncements(newAnnouncements);
  }, [gameState.currentPlayer, gameState.gameStatus, gameState.winner]);

  /**
   * Effect to announce moves for accessibility
   * Converts move coordinates to chess notation (e.g., "a1", "b2") and announces them
   * Also indicates if a piece was captured during the move
   */
  useEffect(() => {
    if (gameState.moveHistory.length > 0) {
      const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];

      // Convert row/column coordinates to chess notation (a1, b2, etc.)
      const fromPos = `${String.fromCharCode(97 + lastMove.from.col)}${
        8 - lastMove.from.row
      }`;
      const toPos = `${String.fromCharCode(97 + lastMove.to.col)}${
        8 - lastMove.to.row
      }`;

      // Create announcement with move details and capture information
      const moveAnnouncement = `${lastMove.piece.color.toLowerCase()} ${
        labels.PIECE_MOVED
      } ${fromPos} ${labels.TO} ${toPos}${
        lastMove.type === "CAPTURE" ? ` ${labels.CAPTURED_PIECE}` : ""
      }`;

      // Add the new announcement to the existing list
      setAnnouncements((prev) => [...prev, moveAnnouncement]);
    }
  }, [gameState.moveHistory]);

  /**
   * Calculates comprehensive game statistics for display in the stats panel and score modal
   * Analyzes current board state and move history to provide detailed game metrics
   *
   * @returns GameStatsType object containing all relevant game statistics
   */
  const calculateGameStats = (): GameStatsType => {
    // Count remaining pieces on the board for each color
    const redPieces = gameState.checkers.filter(
      (c) => c.color === "RED"
    ).length;
    const blackPieces = gameState.checkers.filter(
      (c) => c.color === "BLACK"
    ).length;

    // Count king pieces for each color (kings can move in any direction)
    const redKings = gameState.checkers.filter(
      (c) => c.color === "RED" && c.isKing
    ).length;
    const blackKings = gameState.checkers.filter(
      (c) => c.color === "BLACK" && c.isKing
    ).length;

    // Calculate captured pieces by analyzing move history
    // Each move can capture multiple pieces, so we accumulate all captured pieces
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

    // Return comprehensive stats object
    return {
      redPieces, // Number of red pieces remaining
      blackPieces, // Number of black pieces remaining
      redKings, // Number of red kings on board
      blackKings, // Number of black kings on board
      totalMoves: gameState.moveCount, // Total number of moves made
      gameTime: gameState.gameTime, // Total game time elapsed
      capturedPieces: {
        red: capturedRed, // Array of captured red pieces
        black: capturedBlack, // Array of captured black pieces
      },
    };
  };

  // Render the main game interface
  return (
    <main className="h-dvh w-full flex items-center justify-center flex-col p-4 md:p-8 overflow-hidden">
      {/* Accessibility announcements - hidden from visual users but read by screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcements.map((announcement, index) => (
          <div key={`${announcement}-${index}`}>{announcement}</div>
        ))}
      </div>

      {/* Main game layout - responsive design with board and stats panel */}
      <div className="flex-0 mx-auto w-full flex flex-col md:flex-row gap-4 md:max-w-screen-2xl max-w-[640px]">
        {/* Game board container - maintains square aspect ratio */}
        <div className="flex flex-1 items-top md:items-center justify-center order-2 md:order-1">
          <div className="w-full h-auto aspect-square">
            <Board
              gameState={gameState} // Current game state for board rendering
              onDragEnd={handleDragEnd} // Handler for drag and drop interactions
              onDragStart={handleDragStart} // Handler for starting drag operations
              onSelectPiece={selectPiece} // Handler for piece selection via click/tap
              onMakeMove={makeMove} // Handler for executing moves
              borderVariant={checkerBorderVariant} // Visual style for piece borders
            />
          </div>
        </div>

        {/* Game statistics and controls panel */}
        <GameStats
          gameState={gameState} // Current game state for stats display
          onReset={resetGame} // Function to reset the game
          onToggleAI={toggleAI} // Function to toggle AI opponent
          onToggleTurnTimeLimit={toggleTurnTimeLimit} // Function to toggle turn time limits
          onShowScoreModal={() => setShowScoreModal(true)} // Function to show score modal
          checkerBorderVariant={checkerBorderVariant} // Current border style setting
          onCheckerBorderVariantChange={setCheckerBorderVariant} // Function to change border style
        />
      </div>

      {/* Score modal - displayed when game ends or manually opened */}
      {showScoreModal && (
        <Score
          gameState={gameState} // Current game state for final scores
          gameStats={calculateGameStats()} // Calculated statistics for detailed view
          onNewGame={() => {
            // Handler for starting a new game
            resetGame(); // Reset game state
            setShowScoreModal(false); // Hide the modal
          }}
          onClose={() => setShowScoreModal(false)} // Handler for closing modal without new game
        />
      )}

      {/* Start game card - shown before the first game begins */}
      {!gameState.gameStarted && <StartGameCard onStartGame={startGame} />}
    </main>
  );
}
