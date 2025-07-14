export type Player = 'RED' | 'BLACK';

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

export type MoveType = 'MOVE' | 'CAPTURE' | 'MULTI_CAPTURE';

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
  gameStatus: 'PLAYING' | 'RED_WINS' | 'BLACK_WINS' | 'DRAW';
  winner: Player | null;
  forcedCapture: boolean;
  lastMove: Move | null;
  mustContinueCapture: Position | null;
}

export interface GameSettings {
  isAIEnabled: boolean;
  aiPlayer: Player;
  forcedCaptureEnabled: boolean;
  timerEnabled: boolean;
  moveTimeLimit: number;
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