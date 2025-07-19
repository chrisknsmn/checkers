import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Checker as CheckerType, BorderVariant } from "@/types/game";
import { Checker as UIChecker } from "@/components/ui/checker";

interface CheckerProps {
  piece: CheckerType;
  isDraggable?: boolean;
  cellId: string;
  borderVariant?: BorderVariant;
}

export function Checker({ piece, isDraggable = true, cellId, borderVariant = "default" }: CheckerProps) {
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
    <UIChecker
      ref={setNodeRef}
      variant={borderVariant}
      color={piece.color === "RED" ? "red" : "black"}
      dragging={isDragging}
      isKing={piece.isKing}
      aria-label={`${pieceDescription} on ${position}, ${dragStatus}`}
      data-testid="checker"
      {...listeners}
      {...otherAttributes}
    />
  );
}
