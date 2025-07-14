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
import { getValidMoves } from "@/utils/gameUtils";

interface BoardProps {
  gameState: GameState;
  onDragEnd: (from: Position, to: Position) => void;
}

interface DroppableCellProps {
  id: string;
  cell: Cell;
  isSelected: boolean;
  isHovered: boolean;
  showValidMove: boolean;
  showHoverMove: boolean;
  gameState: GameState;
  onCellHover: (position: Position | null) => void;
}

function DroppableCell({
  id,
  cell,
  isSelected,
  isHovered,
  showValidMove,
  showHoverMove,
  gameState,
  onCellHover,
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
          "bg-gray-50":
            !cell.isDark &&
            !cell.isValidMove &&
            !isSelected &&
            !isHovered &&
            !showHoverMove,
          "bg-gray-200":
            cell.isDark &&
            !cell.isValidMove &&
            !isSelected &&
            !isHovered &&
            !showHoverMove,
          "bg-green-200": (cell.isValidMove || showHoverMove) && !cell.checker,
        }
      )}
      onMouseEnter={() => onCellHover(cell.position)}
      onMouseLeave={() => onCellHover(null)}
      data-testid={`board-square-${id}`}
      style={{
        backgroundColor: (() => {
          // Fallback bg-green-200 when dragged over
          if ((cell.isValidMove || showHoverMove) && !cell.checker) {
            return "#7bf1a8";
          }
          // Fallback for dragging over non-valid cells
          if (isOver && !cell.isValidMove) {
            return cell.isDark ? "#e5e7eb" : "#f9fafb";
          }
          return undefined;
        })(),
      }}
    >
      {cell.checker && (
        <Checker
          piece={cell.checker}
          isSelected={isSelected}
          isDraggable={cell.checker.color === gameState.currentPlayer}
          cellId={id}
        />
      )}

      {(cell.isValidMove || showHoverMove) && !cell.checker && (
        <div
          className={cn(
            "w-4 h-4 bg-green-400 rounded-full opacity-80 transition-all duration-150",
            {
              "w-6 h-6 bg-green-500 opacity-100": isHovered || isOver,
            }
          )}
        />
      )}
    </div>
  );
}

export function Board({ gameState, onDragEnd }: BoardProps) {
  const { board, selectedPiece } = gameState;
  const [activeChecker, setActiveChecker] = useState<CheckerType | null>(null);
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);
  const [hoverValidMoves, setHoverValidMoves] = useState<Position[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

    setActiveChecker(null);
    setHoveredCell(null);
    setHoverValidMoves([]);
  };

  const handleCellHover = (position: Position | null) => {
    // Don't show hover moves while dragging
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
            const showValidMove = false; // Remove selected piece valid moves
            const showHoverMove = hoverValidMoves.some(
              (move) => move.row === rowIndex && move.col === colIndex
            );

            return (
              <DroppableCell
                key={`${rowIndex}-${colIndex}`}
                id={`${rowIndex}-${colIndex}`}
                cell={cell}
                isSelected={isSelected}
                isHovered={isHovered}
                showValidMove={showValidMove}
                showHoverMove={showHoverMove}
                gameState={gameState}
                onCellHover={handleCellHover}
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
