import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Checker as CheckerType } from "@/types/game";
import { cn } from "@/lib/utils";

interface CheckerProps {
  piece: CheckerType;
  isDraggable?: boolean;
  cellId: string;
}

export function Checker({ piece, isDraggable = true, cellId }: CheckerProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: cellId,
    disabled: !isDraggable,
  });

  // Parse position from cellId for accessibility
  const [row, col] = cellId.split("-").map(Number);
  const position = `${String.fromCharCode(65 + col)}${8 - row}`;

  const pieceDescription = `${piece.color.toLowerCase()} ${
    piece.isKing ? "king" : "checker"
  }`;
  const dragStatus = isDragging
    ? "being dragged"
    : isDraggable
    ? "draggable"
    : "not draggable";

  const { ...otherAttributes } = attributes;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-4/5 h-4/5 rounded-full border-4 border-black/30 cursor-grab transition-all duration-100 relative flex items-center justify-center touch-none",
        {
          "bg-red-500 text-white": piece.color === "RED",
          "bg-gray-800 text-white": piece.color === "BLACK",
          "opacity-50": isDragging,
          "cursor-grab": isDraggable,
          "cursor-grabbing": isDragging,
        }
      )}
      aria-label={`${pieceDescription} on ${position}, ${dragStatus}`}
      data-testid="checker"
      {...listeners}
      {...otherAttributes}
    >
      {piece.isKing && (
        <span className="text-yellow-300" aria-hidden="true">
          ♔
        </span>
      )}
    </div>
  );
}
