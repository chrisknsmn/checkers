import { GameState, Cell, Checker, Position, Move } from "@/types/game";
import {
  BOARD_SIZE,
  INITIAL_POSITIONS,
  PLAYER_DIRECTIONS,
  KING_ROW,
} from "@/constants/game";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function cloneGameState(gameState: GameState): GameState {
  return JSON.parse(JSON.stringify(gameState));
}

function getDirectionsForPiece(piece: Checker): number[] {
  return piece.isKing ? [-1, 1] : [PLAYER_DIRECTIONS[piece.color]];
}

function getColumnDirections(): number[] {
  return [-1, 1];
}

function isCapture(from: Position, to: Position): boolean {
  const deltaRow = Math.abs(to.row - from.row);
  const deltaCol = Math.abs(to.col - from.col);
  return deltaRow === 2 && deltaCol === 2;
}

function calculateMoveScore(
  from: Position,
  to: Position,
  currentPlayer: "RED" | "BLACK",
  isCapture: boolean
): number {
  let score = 0;

  if (isCapture) score += 10;

  // Prefer moving towards opponent's side
  score += currentPlayer === "BLACK" ? 7 - to.row : to.row;

  // Prefer making kings
  if (
    (currentPlayer === "BLACK" && to.row === 7) ||
    (currentPlayer === "RED" && to.row === 0)
  ) {
    score += 5;
  }

  // Prefer keeping pieces in center
  score += 3.5 - Math.abs(to.col - 3.5);

  return score;
}

export function isValidPosition(position: Position): boolean {
  return (
    Number.isInteger(position.row) &&
    Number.isInteger(position.col) &&
    position.row >= 0 &&
    position.row < BOARD_SIZE &&
    position.col >= 0 &&
    position.col < BOARD_SIZE
  );
}

// ============================================================================
// BOARD INITIALIZATION
// ============================================================================

export function initializeBoard(): Cell[][] {
  const board: Cell[][] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      const position = { row, col };
      const isDark = (row + col) % 2 === 1;

      board[row][col] = {
        position,
        checker: null,
        isValidMove: false,
        isDark,
      };
    }
  }

  return board;
}

export function initializeCheckers(): Checker[] {
  const checkers: Checker[] = [];

  // Create RED checkers
  INITIAL_POSITIONS.RED.forEach((position, index) => {
    checkers.push({
      id: `red-${index}`,
      color: "RED",
      position,
      isKing: false,
    });
  });

  // Create BLACK checkers
  INITIAL_POSITIONS.BLACK.forEach((position, index) => {
    checkers.push({
      id: `black-${index}`,
      color: "BLACK",
      position,
      isKing: false,
    });
  });

  return checkers;
}

export function initializeGameState(): GameState {
  const board = initializeBoard();
  const checkers = initializeCheckers();

  // Place checkers on board
  checkers.forEach((checker) => {
    board[checker.position.row][checker.position.col].checker = checker;
  });

  return {
    board,
    checkers,
    currentPlayer: "BLACK",
    selectedPiece: null,
    validMoves: [],
    moveHistory: [],
    moveCount: 0,
    gameStatus: "PLAYING",
    winner: null,
    forcedCapture: false,
    lastMove: null,
    mustContinueCapture: null,
    bonusTurnAfterCapture: false,
    gameStartTime: null,
    gameTime: 0,
    timerRunning: false,
    isAIEnabled: true,
    aiPlayer: "RED",
    turnTimeLimitEnabled: false,
    turnStartTime: null,
    turnTimeRemaining: 5000,
    gameStarted: false,
  };
}

// ============================================================================
// MOVE CALCULATION
// ============================================================================

function calculateMovePositions(
  gameState: GameState,
  position: Position,
  piece: Checker
): { captureMoves: Position[]; regularMoves: Position[] } {
  const { board } = gameState;
  const captureMoves: Position[] = [];
  const regularMoves: Position[] = [];
  const rowDirections = getDirectionsForPiece(piece);
  const colDirections = getColumnDirections();

  rowDirections.forEach((rowDirection) => {
    colDirections.forEach((colDirection) => {
      const newRow = position.row + rowDirection;
      const newCol = position.col + colDirection;
      const newPosition = { row: newRow, col: newCol };

      if (isValidPosition(newPosition)) {
        const targetCell = board[newRow][newCol];

        if (!targetCell.checker) {
          regularMoves.push(newPosition);
        } else if (targetCell.checker.color !== piece.color) {
          const jumpRow = newRow + rowDirection;
          const jumpCol = newCol + colDirection;
          const jumpPosition = { row: jumpRow, col: jumpCol };

          if (
            isValidPosition(jumpPosition) &&
            !board[jumpRow][jumpCol].checker
          ) {
            captureMoves.push(jumpPosition);
          }
        }
      }
    });
  });

  return { captureMoves, regularMoves };
}

export function getAllPiecesWithCaptures(gameState: GameState): Position[] {
  const { board, currentPlayer, mustContinueCapture } = gameState;

  if (mustContinueCapture) return [mustContinueCapture];

  return board.flatMap((row, rowIndex) =>
    row
      .map((cell, colIndex) => ({
        cell,
        position: { row: rowIndex, col: colIndex },
      }))
      .filter(({ cell }) => cell.checker?.color === currentPlayer)
      .map(({ position }) => position)
      .filter((position) => getCaptureMoves(gameState, position).length > 0)
  );
}

export function getCaptureMoves(
  gameState: GameState,
  position: Position
): Position[] {
  const { board } = gameState;
  const piece = board[position.row][position.col].checker;

  if (!piece) {
    return [];
  }

  const { captureMoves } = calculateMovePositions(gameState, position, piece);
  return captureMoves;
}

/**
 * Calculates all valid moves for a piece at the given position.
 * Enforces checkers rules including mandatory captures and multi-capture sequences.
 */
export function getValidMoves(
  gameState: GameState,
  position: Position
): Position[] {
  const { board, currentPlayer, mustContinueCapture, bonusTurnAfterCapture } = gameState;
  const piece = board[position.row][position.col].checker;

  if (!piece || piece.color !== currentPlayer) {
    return [];
  }

  // During bonus turn after capture, any piece can move freely
  if (bonusTurnAfterCapture) {
    const { captureMoves, regularMoves } = calculateMovePositions(
      gameState,
      position,
      piece
    );
    return captureMoves.length > 0 ? captureMoves : regularMoves;
  }

  if (mustContinueCapture) {
    if (
      position.row !== mustContinueCapture.row ||
      position.col !== mustContinueCapture.col
    ) {
      return [];
    }
    const { captureMoves, regularMoves } = calculateMovePositions(
      gameState,
      position,
      piece
    );
    // Only allow captures if available
    if (captureMoves.length > 0) {
      return captureMoves;
    }
    return regularMoves;
  }

  // Check if any pieces can capture
  const piecesWithCaptures = getAllPiecesWithCaptures(gameState);
  if (piecesWithCaptures.length > 0) {
    const canThisPieceCapture = piecesWithCaptures.some(
      (pos) => pos.row === position.row && pos.col === position.col
    );
    if (!canThisPieceCapture) {
      return [];
    }
    return getCaptureMoves(gameState, position);
  }

  const { captureMoves, regularMoves } = calculateMovePositions(
    gameState,
    position,
    piece
  );

  if (captureMoves.length > 0) {
    return captureMoves;
  }

  return regularMoves;
}

export function checkForValidMoves(gameState: GameState): boolean {
  const { board } = gameState;

  return board.some((row, rowIndex) =>
    row.some((cell, colIndex) => {
      if (!cell.checker) return false;

      const tempGameState = {
        ...gameState,
        currentPlayer: cell.checker.color,
        mustContinueCapture: null,
      };

      return (
        getValidMoves(tempGameState, { row: rowIndex, col: colIndex }).length >
        0
      );
    })
  );
}

export function canCapture(
  gameState: GameState,
  from: Position,
  to: Position
): boolean {
  const { board } = gameState;
  const piece = board[from.row][from.col].checker;

  if (!piece || !isCapture(from, to)) return false;

  const capturedRow = from.row + (to.row - from.row) / 2;
  const capturedCol = from.col + (to.col - from.col) / 2;
  const middlePiece = board[capturedRow][capturedCol].checker;

  return middlePiece !== null && middlePiece.color !== piece.color;
}

/**
 * AI move selection algorithm for the checkers game.
 * Evaluates all possible moves and selects one of the best options with some randomness.
 * Prioritizes captures and strategic positioning.
 */
export function getAIMove(
  gameState: GameState
): { from: Position; to: Position } | null {
  const { board, currentPlayer, mustContinueCapture, bonusTurnAfterCapture } = gameState;
  
  console.log('AI getAIMove called:', {
    currentPlayer,
    mustContinueCapture,
    bonusTurnAfterCapture,
    gameStatus: gameState.gameStatus
  });

  // Array to collect all possible moves with their scores
  const allMoves: {
    from: Position;
    to: Position;
    isCapture: boolean;
    score: number;
  }[] = [];

  // Determine which pieces to consider:
  // - If it's a bonus turn after capture, consider all pieces belonging to current player
  // - Otherwise, consider all pieces belonging to current player
  const piecesToConsider = mustContinueCapture
    ? [mustContinueCapture]
    : getAllPlayerPiecePositions(board, currentPlayer);

  // Evaluate all possible moves for each piece
  piecesToConsider.forEach((position) => {
    const validMoves = getValidMoves(gameState, position);

    validMoves.forEach((move) => {
      const isCaptureMove = isCapture(position, move);
      const score = calculateMoveScore(
        position,
        move,
        currentPlayer,
        isCaptureMove
      );

      allMoves.push({
        from: position,
        to: move,
        isCapture: isCaptureMove,
        score,
      });
    });
  });

  // No moves available
  if (allMoves.length === 0) return null;

  // Check if there are any capture moves available
  const captureMoves = allMoves.filter(move => move.isCapture);
  
  // If capture moves are available, only consider those (forced captures rule)
  const movesToConsider = captureMoves.length > 0 ? captureMoves : allMoves;
  
  // Select randomly from available moves
  const randomMove = movesToConsider[Math.floor(Math.random() * movesToConsider.length)];

  return { from: randomMove.from, to: randomMove.to };
}


/**
 * Helper function to get all positions of pieces belonging to a specific player
 */
function getAllPlayerPiecePositions(board: Cell[][], player: "RED" | "BLACK"): Position[] {
  return board.flatMap((row, rowIndex) =>
    row
      .map((cell, colIndex) => ({ cell, position: { row: rowIndex, col: colIndex } }))
      .filter(({ cell }) => cell.checker?.color === player)
      .map(({ position }) => position)
  );
}

// ============================================================================
// GAME STATE UPDATES
// ============================================================================

function updateGameEndConditions(gameState: GameState): void {
  const { checkers } = gameState;
  const redPieces = checkers.filter((c) => c.color === "RED");
  const blackPieces = checkers.filter((c) => c.color === "BLACK");

  if (redPieces.length === 0) {
    gameState.gameStatus = "BLACK_WINS";
    gameState.winner = "BLACK";
    gameState.timerRunning = false;
  } else if (blackPieces.length === 0) {
    gameState.gameStatus = "RED_WINS";
    gameState.winner = "RED";
    gameState.timerRunning = false;
  } else {
    const hasValidMoves = checkForValidMoves(gameState);
    if (!hasValidMoves) {
      gameState.gameStatus = "DRAW";
      gameState.winner = null;
      gameState.timerRunning = false;
    }
  }
}

function clearValidMoveIndicators(board: Cell[][]): void {
  board.forEach((row) => {
    row.forEach((cell) => {
      cell.isValidMove = false;
    });
  });
}

function updateValidMoveIndicators(gameState: GameState): void {
  gameState.board.forEach((row) => {
    row.forEach((cell) => {
      cell.isValidMove = gameState.validMoves.some(
        (move) =>
          move.row === cell.position.row && move.col === cell.position.col
      );
    });
  });
}

function switchPlayer(gameState: GameState): void {
  gameState.currentPlayer = gameState.currentPlayer === "RED" ? "BLACK" : "RED";
  gameState.bonusTurnAfterCapture = false;
}

/**
 * Helper function to clear piece selection and move indicators
 */
function clearSelection(gameState: GameState): void {
  gameState.selectedPiece = null;
  gameState.validMoves = [];
  clearValidMoveIndicators(gameState.board);
}

function processPieceMove(
  gameState: GameState,
  from: Position,
  to: Position
): void {
  const { board, checkers } = gameState;
  const piece = board[from.row][from.col].checker!;

  board[from.row][from.col].checker = null;
  board[to.row][to.col].checker = piece;

  const checkerIndex = checkers.findIndex((c) => c.id === piece.id);
  if (checkerIndex !== -1) {
    checkers[checkerIndex].position = to;

    if (to.row === KING_ROW[piece.color]) {
      checkers[checkerIndex].isKing = true;
      board[to.row][to.col].checker!.isKing = true;
    }
  }
}

function processCaptureMove(
  gameState: GameState,
  from: Position,
  to: Position
): Checker[] {
  const { board, checkers } = gameState;
  const capturedRow = from.row + (to.row - from.row) / 2;
  const capturedCol = from.col + (to.col - from.col) / 2;
  const capturedPiece = board[capturedRow][capturedCol].checker;
  const capturedPieces: Checker[] = [];

  if (capturedPiece) {
    board[capturedRow][capturedCol].checker = null;
    capturedPieces.push(capturedPiece);

    const capturedIndex = checkers.findIndex((c) => c.id === capturedPiece.id);
    if (capturedIndex !== -1) {
      checkers.splice(capturedIndex, 1);
    }
  }

  return capturedPieces;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Applies a move to the game state, handling all game logic including:
 * - Moving pieces and updating positions
 * - Processing captures and removing captured pieces
 * - Promoting pieces to kings when they reach the end
 * - Handling multi-capture sequences
 * - Switching turns (unless continuing a multi-capture)
 * - Recording move history and updating game status
 */
export function applyMove(
  gameState: GameState,
  from: Position,
  to: Position
): GameState {
  const newGameState = cloneGameState(gameState);
  const { board, checkers } = newGameState;

  const piece = board[from.row][from.col].checker;
  if (!piece) return gameState;

  // Validate the move is legal
  const validMoves = getValidMoves(gameState, from);
  const isValidMove = validMoves.some(
    (move) => move.row === to.row && move.col === to.col
  );
  if (!isValidMove) return gameState;

  processPieceMove(newGameState, from, to);

  const isCapture = canCapture(gameState, from, to);
  const capturedPieces: Checker[] = [];

  // Handle capture
  if (isCapture) {
    console.log('Processing capture move from', from, 'to', to, 'for player', piece.color);
    capturedPieces.push(...processCaptureMove(newGameState, from, to));

    // Grant a bonus turn after capture (can move any piece)
    newGameState.mustContinueCapture = null;
    newGameState.bonusTurnAfterCapture = true;
    clearSelection(newGameState);
    
    console.log('After capture - bonusTurnAfterCapture:', newGameState.bonusTurnAfterCapture, 'currentPlayer:', newGameState.currentPlayer);

    const move: Move = {
      id: `move-${Date.now()}`,
      from,
      to,
      type: "CAPTURE",
      piece,
      capturedPieces,
      timestamp: Date.now(),
    };

    newGameState.moveHistory.push(move);
    newGameState.lastMove = move;
    newGameState.moveCount++;

    // Don't switch players - same player gets bonus turn
    clearValidMoveIndicators(newGameState.board);
    updateGameEndConditions(newGameState);
    
    console.log('Returning capture state with bonus turn for', newGameState.currentPlayer);
    return newGameState;
  }

  // Handle bonus turn after capture
  if (gameState.bonusTurnAfterCapture) {
    const move: Move = {
      id: `move-${Date.now()}`,
      from,
      to,
      type: "CONTINUATION_MOVE",
      piece,
      capturedPieces,
      timestamp: Date.now(),
    };

    newGameState.moveHistory.push(move);
    newGameState.lastMove = move;
    newGameState.moveCount++;

    // If this move was also a capture, continue the bonus turn
    if (capturedPieces.length > 0) {
      // Keep bonus turn active - the AI will get another chance to move
      console.log('Bonus turn capture - continuing bonus turn for', newGameState.currentPlayer);
      newGameState.bonusTurnAfterCapture = true;
    } else {
      // No capture made during bonus turn - end bonus turn and switch players
      console.log('Bonus turn ended - no capture made');
      newGameState.bonusTurnAfterCapture = false;
      switchPlayer(newGameState);
    }

    clearSelection(newGameState);
    clearValidMoveIndicators(newGameState.board);
    updateGameEndConditions(newGameState);

    return newGameState;
  }

  newGameState.mustContinueCapture = null;

  const move: Move = {
    id: `move-${Date.now()}`,
    from,
    to,
    type: "MOVE",
    piece,
    capturedPieces,
    timestamp: Date.now(),
  };

  newGameState.moveHistory.push(move);
  newGameState.lastMove = move;
  newGameState.moveCount++;

  switchPlayer(newGameState);
  clearSelection(newGameState);
  clearValidMoveIndicators(newGameState.board);
  updateGameEndConditions(newGameState);

  return newGameState;
}

/**
 * Handles piece selection logic for the checkers game.
 * This function determines what happens when a player clicks on a square.
 */
export function selectPiece(
  gameState: GameState,
  position: Position
): GameState {
  const newGameState = { ...gameState };
  const piece = newGameState.board[position.row][position.col].checker;

  // Check if player must continue a multi-capture sequence
  if (newGameState.mustContinueCapture) {
    const isContinuingCapture = 
      position.row === newGameState.mustContinueCapture.row &&
      position.col === newGameState.mustContinueCapture.col;

    if (isContinuingCapture) {
      // Allow selection of the piece that must continue capturing
      selectPieceAndShowMoves(newGameState, position);
    } else {
      // Ignore selection - player must use the piece that can continue capturing
      return newGameState;
    }
  } 
  // Check if clicking on own piece during normal play
  else if (piece && piece.color === newGameState.currentPlayer) {
    // Select the piece and show possible moves
    selectPieceAndShowMoves(newGameState, position);
  } 
  // Clicking on empty square or opponent piece
  else {
    // Clear any current selection
    clearSelection(newGameState);
  }

  return newGameState;
}

/**
 * Helper function to select a piece and calculate its valid moves
 */
function selectPieceAndShowMoves(gameState: GameState, position: Position): void {
  gameState.selectedPiece = position;
  gameState.validMoves = getValidMoves(gameState, position);
  updateValidMoveIndicators(gameState);
}


export function makeMove(gameState: GameState, to: Position): GameState {
  if (!gameState.selectedPiece) return gameState;

  const isValidMove = gameState.validMoves.some(
    (move) => move.row === to.row && move.col === to.col
  );

  if (!isValidMove) return gameState;

  return applyMove(gameState, gameState.selectedPiece, to);
}
