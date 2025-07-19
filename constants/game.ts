import { Player, Position } from "@/types/game";

export const BOARD_SIZE = 8;

export const INITIAL_POSITIONS: Record<Player, Position[]> = {
  BLACK: [
    // Row 5
    { row: 5, col: 0 },
    { row: 5, col: 2 },
    { row: 5, col: 4 },
    { row: 5, col: 6 },
    // Row 6
    { row: 6, col: 1 },
    { row: 6, col: 3 },
    { row: 6, col: 5 },
    { row: 6, col: 7 },
    // Row 7
    { row: 7, col: 0 },
    { row: 7, col: 2 },
    { row: 7, col: 4 },
    { row: 7, col: 6 },
  ],
  RED: [
    // Row 0
    { row: 0, col: 1 },
    { row: 0, col: 3 },
    { row: 0, col: 5 },
    { row: 0, col: 7 },
    // Row 1
    { row: 1, col: 0 },
    { row: 1, col: 2 },
    { row: 1, col: 4 },
    { row: 1, col: 6 },
    // Row 2
    { row: 2, col: 1 },
    { row: 2, col: 3 },
    { row: 2, col: 5 },
    { row: 2, col: 7 },
  ],
};

export const PLAYER_DIRECTIONS: Record<Player, number> = {
  BLACK: -1,
  RED: 1,
};

export const KING_ROW: Record<Player, number> = {
  BLACK: 0,
  RED: 7,
};
