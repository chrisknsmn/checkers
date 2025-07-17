import { Player, Position, GameSettings } from "@/types/game";

export const BOARD_SIZE = 8;

export const INITIAL_POSITIONS: Record<Player, Position[]> = {
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
};

export const PLAYER_DIRECTIONS: Record<Player, number> = {
  RED: 1,
  BLACK: -1,
};

export const KING_ROW: Record<Player, number> = {
  RED: 7,
  BLACK: 0,
};

export const DEFAULT_SETTINGS: GameSettings = {
  isAIEnabled: false,
  aiPlayer: "BLACK",
  forcedCaptureEnabled: true,
  timerEnabled: false,
  moveTimeLimit: 60000,
};

export const GAME_RULES = {
  MAX_PIECES_PER_PLAYER: 12,
  MIN_PIECES_FOR_GAME: 1,
  CAPTURE_REQUIRED: true,
  MULTIPLE_CAPTURES_REQUIRED: true,
  KING_CAN_MOVE_BACKWARDS: true,
  REGULAR_PIECE_SINGLE_STEP: true,
} as const;

export const ANIMATION_DURATIONS = {
  PIECE_MOVE: 300,
  PIECE_CAPTURE: 200,
  BOARD_HIGHLIGHT: 150,
  KING_PROMOTION: 500,
} as const;

export const BOARD_LAYOUT = {
  CELL_SIZE: 64,
  PIECE_SIZE_RATIO: 0.8,
  BORDER_WIDTH: 2,
  GAP_SIZE: 1,
} as const;

export const GAME_MESSAGES = {
  RED_TURN: "Red's Turn",
  BLACK_TURN: "Black's Turn",
  RED_WINS: "Red Wins!",
  BLACK_WINS: "Black Wins!",
  DRAW: "Game Draw",
  SELECT_PIECE: "Select a piece to move",
  INVALID_MOVE: "Invalid move",
  CAPTURE_REQUIRED: "You must capture when possible",
  PROMOTION: "Piece promoted to King!",
} as const;
