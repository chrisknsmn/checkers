import React, { useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, closestCenter, useDroppable, TouchSensor, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { GameState, Position, Cell, Checker as CheckerType } from "@/types/game";
import { Checker } from "./Checker";
import { cn } from "@/lib/utils";

interface BoardProps {
  gameState: GameState;
  onCellClick: (position: Position) => void;
  onDragEnd: (from: Position, to: Position) => void;
}

interface DroppableCellProps {
  id: string;
  cell: Cell;
  isSelected: boolean;
  isHovered: boolean;
  showValidMove: boolean;
  onCellClick: (position: Position) => void;
  gameState: GameState;
}

function DroppableCell({ id, cell, isSelected, isHovered, showValidMove, onCellClick, gameState }: DroppableCellProps) {
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
            !cell.isDark && !cell.isValidMove && !isSelected && !isHovered,
          "bg-gray-200":
            cell.isDark && !cell.isValidMove && !isSelected && !isHovered,
          "bg-green-300": isSelected || showValidMove,
          "bg-green-400": (isHovered && cell.isValidMove) || (isOver && cell.isValidMove),
          "hover:bg-green-200":
            (!cell.isDark && !cell.isValidMove && !isSelected) ||
            (cell.isDark && !cell.isValidMove && !isSelected) ||
            isSelected,
        }
      )}
      onClick={() => onCellClick(cell.position)}
      data-testid={`board-square-${id}`}
    >
      {cell.checker && (
        <Checker
          piece={cell.checker}
          isSelected={isSelected}
          onClick={() => onCellClick(cell.position)}
          isDraggable={cell.checker.color === gameState.currentPlayer}
          cellId={id}
        />
      )}

      {cell.isValidMove && !cell.checker && (
        <div className={cn(
          "w-4 h-4 bg-green-400 rounded-full opacity-80 transition-all duration-150",
          {
            "w-6 h-6 bg-green-500 opacity-100": isHovered || isOver,
          }
        )} />
      )}
    </div>
  );
}

export function Board({ gameState, onCellClick, onDragEnd }: BoardProps) {
  const { board, selectedPiece } = gameState;
  const [activeChecker, setActiveChecker] = useState<CheckerType | null>(null);
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);

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
    const [row, col] = active.id.toString().split('-').map(Number);
    const checker = board[row][col].checker;
    if (checker) {
      setActiveChecker(checker);
      onCellClick({ row, col });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const [row, col] = over.id.toString().split('-').map(Number);
      setHoveredCell({ row, col });
    } else {
      setHoveredCell(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const [fromRow, fromCol] = active.id.toString().split('-').map(Number);
      const [toRow, toCol] = over.id.toString().split('-').map(Number);
      
      onDragEnd({ row: fromRow, col: fromCol }, { row: toRow, col: toCol });
    }
    
    setActiveChecker(null);
    setHoveredCell(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex items-center justify-center">
        <div className="w-auto h-full md:w-full aspect-square">
          <div className="grid grid-cols-8 gap-1 p-2 bg-gray-400 w-full h-full rounded-xl">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isSelected =
                  selectedPiece?.row === rowIndex &&
                  selectedPiece?.col === colIndex;
                const isHovered =
                  hoveredCell?.row === rowIndex &&
                  hoveredCell?.col === colIndex;
                const showValidMove = cell.isValidMove && (isHovered || !activeChecker);
                
                return (
                  <DroppableCell
                    key={`${rowIndex}-${colIndex}`}
                    id={`${rowIndex}-${colIndex}`}
                    cell={cell}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    showValidMove={showValidMove}
                    onCellClick={onCellClick}
                    gameState={gameState}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
      
      <DragOverlay>
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
