import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Checker as CheckerType } from "@/types/game";
import { cn } from "@/lib/utils";

interface CheckerProps {
  piece: CheckerType;
  isSelected?: boolean;
  isDraggable?: boolean;
  cellId: string;
}

export function Checker({
  piece,
  isSelected = false,
  isDraggable = true,
  cellId,
}: CheckerProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: cellId,
    disabled: !isDraggable,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "checker w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 touch-none select-none",
        {
          "bg-red-500 text-white": piece.color === "RED",
          "bg-gray-800 text-white": piece.color === "BLACK",
          "opacity-50": isDragging,
          "cursor-grab": isDraggable,
          "cursor-grabbing": isDragging,
        }
      )}
      data-testid="checker"
      {...listeners}
      {...attributes}
    >
      {piece.isKing && <span className="text-yellow-300">♔</span>}
    </div>
  );
}
