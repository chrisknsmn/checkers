export type Player = "RED" | "BLACK";

export enum GameConstants {
  CAPTURE_DISTANCE = 2,
  BOARD_CENTER = 3.5,
  DIRECTION_COLUMNS = 1,
  DIRECTION_ROWS = 1,
  KING_SCORE_BONUS = 5,
  CAPTURE_SCORE_BONUS = 10,
  MAX_AI_MOVES_CONSIDERED = 3,
}

export interface Position {
  row: number;
  col: number;
}

export interface Checker {
  id: string;
  color: Player;
  position: Position;
  isKing: boolean;
}

export interface Cell {
  position: Position;
  checker: Checker | null;
  isValidMove: boolean;
  isDark: boolean;
}

export type MoveType =
  | "MOVE"
  | "CAPTURE"
  | "MULTI_CAPTURE"
  | "CONTINUATION_MOVE";

export interface Move {
  id: string;
  from: Position;
  to: Position;
  type: MoveType;
  piece: Checker;
  capturedPieces: Checker[];
  timestamp: number;
}

export interface GameState {
  board: Cell[][];
  checkers: Checker[];
  currentPlayer: Player;
  selectedPiece: Position | null;
  validMoves: Position[];
  moveHistory: Move[];
  moveCount: number;
  gameStatus: "PLAYING" | "RED_WINS" | "BLACK_WINS" | "DRAW";
  winner: Player | null;
  forcedCapture: boolean;
  lastMove: Move | null;
  mustContinueCapture: Position | null;
  bonusTurnAfterCapture: boolean;
  gameStartTime: number | null;
  gameTime: number;
  timerRunning: boolean;
  isAIEnabled: boolean;
  aiPlayer: Player;
  turnTimeLimitEnabled: boolean;
  turnStartTime: number | null;
  turnTimeRemaining: number;
}

export interface GameStats {
  redPieces: number;
  blackPieces: number;
  redKings: number;
  blackKings: number;
  totalMoves: number;
  gameTime: number;
  capturedPieces: {
    red: Checker[];
    black: Checker[];
  };
}

export type BorderVariant = "solid" | "dashed" | "dots" | "none";

export type GameAction =
  | { type: "SELECT_PIECE"; payload: Position }
  | { type: "MAKE_MOVE"; payload: Position }
  | { type: "MAKE_DIRECT_MOVE"; payload: { from: Position; to: Position } }
  | { type: "RESET_GAME" }
  | { type: "START_TIMER" }
  | { type: "UPDATE_TIMER"; payload: number }
  | { type: "TOGGLE_AI"; payload: boolean }
  | { type: "MAKE_AI_MOVE" }
  | { type: "TOGGLE_TURN_TIME_LIMIT"; payload: boolean }
  | { type: "START_TURN_TIMER" }
  | { type: "UPDATE_TURN_TIMER"; payload: number }
  | { type: "TURN_TIME_EXPIRED" };
