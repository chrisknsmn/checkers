import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import {
  GameState,
  Position,
  Cell,
  Checker as CheckerType,
} from "@/types/game";
import { Checker } from "./Checker";
import { cn } from "@/lib/utils";
import { getValidMoves, getAllPiecesWithCaptures } from "@/utils/gameUtils";

interface BoardProps {
  gameState: GameState;
  onDragEnd: (from: Position, to: Position) => void;
  onDragStart?: (position: Position) => void;
}

interface DroppableCellProps {
  id: string;
  cell: Cell;
  isSelected: boolean;
  isHovered: boolean;
  showHoverMove: boolean;
  gameState: GameState;
  onCellHover: (position: Position | null) => void;
  hasCapture: boolean;
}

function DroppableCell({
  id,
  cell,
  isSelected,
  isHovered,
  showHoverMove,
  gameState,
  onCellHover,
  hasCapture,
}: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "board-square rounded-lg",
        "w-full aspect-square flex items-center justify-center cursor-pointer transition-all duration-150",
        "relative touch-none select-none",
        {
          // Base colors for all cells
          "bg-gray-50": !cell.isDark,
          "bg-gray-200": cell.isDark,
          // Override with special states
          "bg-green-200": showHoverMove && !cell.checker,
          "bg-green-500": isOver && showHoverMove,
          "bg-green-300": isSelected,
          "bg-blue-200": isHovered && !showHoverMove && !isSelected,
        }
      )}
      onMouseEnter={() => onCellHover(cell.position)}
      onMouseLeave={() => onCellHover(null)}
      data-testid={`board-square-${id}`}
      style={{
        backgroundColor: (() => {
          // Fallback color for cells
          if (isOver && showHoverMove) {
            return "#7bf1a8";
          }
          // Not selected
          if (isOver && !showHoverMove) {
            return cell.isDark ? "#e5e7eb" : "#f9fafb";
          }
          return undefined;
        })(),
      }}
    >
      {cell.checker && (
        <div className="relative w-full h-full flex items-center justify-center">
          <Checker
            piece={cell.checker}
            isSelected={isSelected}
            isDraggable={cell.checker.color === gameState.currentPlayer}
            cellId={id}
          />
          {hasCapture && (
            <div className="absolute inset-[5px] rounded-full border-4 border-green-500 animate-pulse pointer-events-none" />
          )}
        </div>
      )}

      {(cell.isValidMove || showHoverMove) && !cell.checker && (
        <div
          className={cn(
            "w-4 h-4 bg-green-400 rounded-full opacity-80 transition-all duration-150 border",
            {
              "w-4 h-4 bg-green-400 opacity-100": isHovered || isOver,
            }
          )}
        />
      )}
    </div>
  );
}

export function Board({ gameState, onDragEnd, onDragStart }: BoardProps) {
  const { board, selectedPiece } = gameState;
  const [activeChecker, setActiveChecker] = useState<CheckerType | null>(null);
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);
  const [hoverValidMoves, setHoverValidMoves] = useState<Position[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [piecesWithCaptures, setPiecesWithCaptures] = useState<Position[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Update pieces that can capture when game state changes
    setPiecesWithCaptures(getAllPiecesWithCaptures(gameState));
  }, [gameState]);

  // Clear hover state only when the current player changes (turn ends)
  useEffect(() => {
    setHoverValidMoves([]);
    setHoveredCell(null);
  }, [gameState.currentPlayer]);

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 8,
    },
  });

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const sensors = useSensors(touchSensor, mouseSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const [row, col] = active.id.toString().split("-").map(Number);
    const checker = board[row][col].checker;
    if (checker && checker.color === gameState.currentPlayer) {
      setActiveChecker(checker);
      // Calculate valid moves for dragging
      const validMoves = getValidMoves(gameState, { row, col });
      setHoverValidMoves(validMoves);

      // Trigger timer start
      if (onDragStart) {
        onDragStart({ row, col });
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const [row, col] = over.id.toString().split("-").map(Number);
      setHoveredCell({ row, col });
    } else {
      setHoveredCell(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const [fromRow, fromCol] = active.id.toString().split("-").map(Number);
      const [toRow, toCol] = over.id.toString().split("-").map(Number);

      onDragEnd({ row: fromRow, col: fromCol }, { row: toRow, col: toCol });
    }

    // Clear all drag and hover states
    setActiveChecker(null);
    setHoveredCell(null);
    setHoverValidMoves([]);
  };

  const handleCellHover = (position: Position | null) => {
    if (activeChecker) return;
    if (position) {
      const cell = board[position.row][position.col];
      if (cell.checker && cell.checker.color === gameState.currentPlayer) {
        const validMoves = getValidMoves(gameState, position);
        setHoverValidMoves(validMoves);
      } else {
        setHoverValidMoves([]);
      }
    } else {
      setHoverValidMoves([]);
    }
  };

  const boardContent = (
    <div className="w-full aspect-square max-w-full max-h-full">
      <div className="grid grid-cols-8 gap-1 p-2 bg-gray-400 w-full h-full rounded-xl">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected =
              selectedPiece?.row === rowIndex &&
              selectedPiece?.col === colIndex;
            const isHovered =
              hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;
            const showHoverMove = hoverValidMoves.some(
              (move) => move.row === rowIndex && move.col === colIndex
            );
            const hasCapture =
              cell.checker &&
              cell.checker.color === gameState.currentPlayer &&
              piecesWithCaptures.some(
                (pos) => pos.row === rowIndex && pos.col === colIndex
              );

            return (
              <DroppableCell
                key={`${rowIndex}-${colIndex}`}
                id={`${rowIndex}-${colIndex}`}
                cell={cell}
                isSelected={isSelected}
                isHovered={isHovered}
                showHoverMove={showHoverMove}
                gameState={gameState}
                onCellHover={handleCellHover}
                hasCapture={!!hasCapture}
              />
            );
          })
        )}
      </div>
    </div>
  );

  if (!isClient) {
    return boardContent;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {boardContent}
      <DragOverlay
        style={{
          boxShadow: "none !important",
          filter: "none !important",
        }}
      >
        {activeChecker && (
          <Checker
            piece={activeChecker}
            isSelected={true}
            isDraggable={false}
            cellId=""
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
