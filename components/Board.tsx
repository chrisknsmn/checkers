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
  BorderVariant,
} from "@/types/game";
import { Checker } from "./Checker";
import { cn } from "@/lib/utils";
import { getValidMoves, getAllPiecesWithCaptures } from "@/utils/gameUtils";
import { labels } from "@/constants/text";

interface BoardProps {
  gameState: GameState;
  onDragEnd: (from: Position, to: Position) => void;
  onDragStart?: (position: Position) => void;
  onSelectPiece: (position: Position) => void;
  onMakeMove: (position: Position) => void;
  borderVariant?: BorderVariant;
}

interface DroppableCellProps {
  id: string;
  cell: Cell;
  isHovered: boolean;
  showHoverMove: boolean;
  gameState: GameState;
  onCellHover: (position: Position | null) => void;
  onSelectPiece: (position: Position) => void;
  onMakeMove: (position: Position) => void;
  isSelected: boolean;
  isDragging: boolean;
  canMove: boolean;
  borderVariant?: BorderVariant;
}

function DroppableCell({
  id,
  cell,
  showHoverMove,
  gameState,
  onCellHover,
  onSelectPiece,
  onMakeMove,
  isSelected,
  isDragging,
  canMove,
  borderVariant,
}: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Parse position for accessibility
  const [row, col] = id.split("-").map(Number);
  const position = `${String.fromCharCode(65 + col)}${8 - row}`;

  // Create descriptive cell state
  const cellState = cell.checker
    ? `${labels.OCCUPIED_BY} ${cell.checker.color.toLowerCase()} ${
        cell.checker.isKing ? labels.KING : labels.CHECKER
      }`
    : cell.isDark
    ? labels.EMPTY_DARK_SQUARE
    : labels.EMPTY_LIGHT_SQUARE;

  const validMoveState =
    showHoverMove && !cell.checker ? `, ${labels.VALID_MOVE_TARGET}` : "";
  const dropState =
    isOver && showHoverMove ? `, ${labels.DROP_TARGET_ACTIVE}` : "";

  // Handle click on board cell
  const handleCellClick = () => {
    const cellPosition = { row, col };

    // If clicking on a piece of the current player, select it
    if (cell.checker && cell.checker.color === gameState.currentPlayer) {
      onSelectPiece(cellPosition);
    }
    // If clicking on a valid move square (empty and highlighted green), make the move
    else if (!cell.checker && showHoverMove) {
      onMakeMove(cellPosition);
    }
    // Otherwise, clicking on an empty square or opponent piece clears selection
    else {
      onSelectPiece(cellPosition);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg hover:opacity-90",
        "w-full aspect-square flex items-center justify-center cursor-pointer transition-all duration-150",
        "relative touch-none select-none",
        {
          // Base colors for all cells
          "bg-tile-light": !cell.isDark,
          "bg-tile-dark": cell.isDark,
          "bg-green-200": showHoverMove && !cell.checker,
          "bg-green-300": isOver && showHoverMove,
        }
      )}
      role="gridcell"
      aria-label={`${position}, ${cellState}${validMoveState}${dropState}`}
      onClick={handleCellClick}
      onMouseEnter={() => onCellHover(cell.position)}
      onMouseLeave={() => onCellHover(null)}
      data-testid={`board-square-${id}`}
    >
      {cell.checker && (
        <div className="relative w-full h-full flex items-center justify-center">
          <Checker
            piece={cell.checker}
            isDraggable={cell.checker.color === gameState.currentPlayer}
            cellId={id}
            borderVariant={borderVariant}
          />
          {/* Ring indicators for piece states */}
          {(isSelected || isDragging) && (
            <div className="absolute inset-[7px] sm:inset-[7px] rounded-full border-4 md:border-6 border-yellow-400 pointer-events-none" />
          )}
          {canMove && !isSelected && !isDragging && (
            <div className="absolute inset-[3px] sm:inset-[7px] rounded-full border-4 md:border-6 border-green-500 pointer-events-none" />
          )}
        </div>
      )}

      {(cell.isValidMove || showHoverMove) && !cell.checker && (
        <div
          className={cn(
            "w-4 h-4 bg-green-400 rounded-full opacity-80 transition-all duration-150"
          )}
        />
      )}
    </div>
  );
}

export function Board({
  gameState,
  onDragEnd,
  onDragStart,
  onSelectPiece,
  onMakeMove,
  borderVariant,
}: BoardProps) {
  const { board } = gameState;
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

  // Clear hover state when turn ends
  useEffect(() => {
    setHoverValidMoves([]);
    setHoveredCell(null);
  }, [gameState.currentPlayer]);

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 10,
    },
  });

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

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
      <div
        className="grid grid-cols-8 gap-1 p-2 bg-board w-full h-full rounded-lg"
        role="grid"
        aria-label={`${
          labels.GAME_BOARD
        }, ${gameState.currentPlayer.toLowerCase()} ${labels.PLAYER_TURN}`}
        aria-describedby="board-instructions"
      >
        {board.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} role="row" className="contents">
            {row.map((cell, colIndex) => {
              const isHovered =
                hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;
              const showHoverMove =
                hoverValidMoves.some(
                  (move) => move.row === rowIndex && move.col === colIndex
                ) ||
                gameState.validMoves.some(
                  (move) => move.row === rowIndex && move.col === colIndex
                );
              const hasCapture =
                cell.checker &&
                cell.checker.color === gameState.currentPlayer &&
                piecesWithCaptures.some(
                  (pos) => pos.row === rowIndex && pos.col === colIndex
                );

              const isSelected =
                gameState.selectedPiece &&
                gameState.selectedPiece.row === rowIndex &&
                gameState.selectedPiece.col === colIndex;

              const isDragging =
                activeChecker && cell.checker?.id === activeChecker.id;

              // Check if this specific piece can actually move this turn
              const canMove =
                cell.checker &&
                cell.checker.color === gameState.currentPlayer &&
                (hasCapture ||
                  (piecesWithCaptures.length === 0 &&
                    getValidMoves(gameState, { row: rowIndex, col: colIndex })
                      .length > 0));

              return (
                <DroppableCell
                  key={`${rowIndex}-${colIndex}`}
                  id={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  isHovered={isHovered}
                  showHoverMove={showHoverMove}
                  gameState={gameState}
                  onCellHover={handleCellHover}
                  onSelectPiece={onSelectPiece}
                  onMakeMove={onMakeMove}
                  isSelected={!!isSelected}
                  isDragging={!!isDragging}
                  canMove={!!canMove}
                  borderVariant={borderVariant}
                />
              );
            })}
          </div>
        ))}
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
      {/* Hidden instructions for screen readers */}
      <div id="board-instructions" className="sr-only">
        {labels.NAVIGATION_INSTRUCTIONS}
      </div>
      <div id="drag-instructions" className="sr-only">
        {labels.DRAG_INSTRUCTIONS}
      </div>

      {boardContent}
      <DragOverlay>
        {activeChecker && (
          <Checker
            piece={activeChecker}
            isDraggable={false}
            cellId=""
            borderVariant={borderVariant}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
