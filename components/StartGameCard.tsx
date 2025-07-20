import React from "react";
import { Button } from "@/components/ui/button";

interface StartGameCardProps {
  onStartGame: (isAI: boolean) => void;
}

export function StartGameCard({ onStartGame }: StartGameCardProps) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg p-8 shadow-lg max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Checkers</h1>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <h3 className="font-semibold text-foreground">How to Play:</h3>
          <ul className="space-y-1">
            <li>• The black piece moves first</li>
            <li>• Move pieces diagonally on dark squares</li>
            <li>• Green rings identify available moves</li>
            <li>• Drag or click to move pices</li>
            <li>• Taking a piece wins the player another move</li>
            <li>• Reach the opposite end to become a king</li>
            <li>• Win by capturing all opponent pieces</li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground text-center">
            Choose your game mode to begin
          </p>
          <Button
            onClick={() => onStartGame(true)}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            Play vs AI
          </Button>
          <Button
            onClick={() => onStartGame(false)}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            2 Player Game
          </Button>
        </div>
      </div>
    </div>
  );
}
