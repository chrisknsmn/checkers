import React from "react";
import { Checker as CheckerType } from "@/types/game";
import { cn } from "@/lib/utils";

interface CheckerProps {
  piece: CheckerType;
  isSelected?: boolean;
  onClick?: () => void;
}

export function Checker({ piece, isSelected = false, onClick }: CheckerProps) {
  return (
    <div
      className={cn("checker", {
        "bg-red-500 text-white": piece.color === "RED",
        "bg-gray-800 text-white": piece.color === "BLACK",
        "ring-4 ring-yellow-400": isSelected,
        king: piece.isKing,
      })}
      onClick={onClick}
      data-testid="checker"
    >
      {piece.isKing && <span className="text-yellow-300">♔</span>}
    </div>
  );
}
