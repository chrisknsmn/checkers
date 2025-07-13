import { GameState, Cell, Checker, Position, Player, Move, MoveType } from '@/types/game';
import { BOARD_SIZE, INITIAL_POSITIONS, PLAYER_DIRECTIONS, KING_ROW } from '@/constants/game';

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
        isDark
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
      color: 'RED',
      position,
      isKing: false
    });
  });
  
  // Create BLACK checkers
  INITIAL_POSITIONS.BLACK.forEach((position, index) => {
    checkers.push({
      id: `black-${index}`,
      color: 'BLACK',
      position,
      isKing: false
    });
  });
  
  return checkers;
}

export function initializeGameState(): GameState {
  const board = initializeBoard();
  const checkers = initializeCheckers();
  
  // Place checkers on board
  checkers.forEach(checker => {
    board[checker.position.row][checker.position.col].checker = checker;
  });
  
  return {
    board,
    checkers,
    currentPlayer: 'RED',
    selectedPiece: null,
    validMoves: [],
    moveHistory: [],
    moveCount: 0,
    gameStatus: 'PLAYING',
    winner: null,
    forcedCapture: false,
    lastMove: null
  };
}

export function isValidPosition(position: Position): boolean {
  return position.row >= 0 && position.row < BOARD_SIZE && 
         position.col >= 0 && position.col < BOARD_SIZE;
}

export function getValidMoves(gameState: GameState, position: Position): Position[] {
  const { board, currentPlayer } = gameState;
  const piece = board[position.row][position.col].checker;
  
  if (!piece || piece.color !== currentPlayer) {
    return [];
  }
  
  const moves: Position[] = [];
  const directions = piece.isKing ? [-1, 1] : [PLAYER_DIRECTIONS[piece.color]];
  
  directions.forEach(rowDirection => {
    [-1, 1].forEach(colDirection => {
      const newRow = position.row + rowDirection;
      const newCol = position.col + colDirection;
      const newPosition = { row: newRow, col: newCol };
      
      if (isValidPosition(newPosition)) {
        const targetCell = board[newRow][newCol];
        
        if (!targetCell.checker) {
          // Simple move to empty square
          moves.push(newPosition);
        } else if (targetCell.checker.color !== piece.color) {
          // Potential capture
          const jumpRow = newRow + rowDirection;
          const jumpCol = newCol + colDirection;
          const jumpPosition = { row: jumpRow, col: jumpCol };
          
          if (isValidPosition(jumpPosition) && !board[jumpRow][jumpCol].checker) {
            moves.push(jumpPosition);
          }
        }
      }
    });
  });
  
  return moves;
}

export function canCapture(gameState: GameState, from: Position, to: Position): boolean {
  const { board } = gameState;
  const piece = board[from.row][from.col].checker;
  
  if (!piece) return false;
  
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  
  // Must be diagonal move of distance 2
  if (Math.abs(rowDiff) !== 2 || Math.abs(colDiff) !== 2) {
    return false;
  }
  
  // Check if there's an enemy piece in between
  const midRow = from.row + rowDiff / 2;
  const midCol = from.col + colDiff / 2;
  const middlePiece = board[midRow][midCol].checker;
  
  return middlePiece !== null && middlePiece.color !== piece.color;
}

export function applyMove(gameState: GameState, from: Position, to: Position): GameState {
  const newGameState = JSON.parse(JSON.stringify(gameState)) as GameState;
  const { board, checkers } = newGameState;
  
  const piece = board[from.row][from.col].checker;
  if (!piece) return gameState;
  
  // Move the piece
  board[from.row][from.col].checker = null;
  board[to.row][to.col].checker = piece;
  
  // Update piece position
  const checkerIndex = checkers.findIndex(c => c.id === piece.id);
  if (checkerIndex !== -1) {
    checkers[checkerIndex].position = to;
    
    // Check for king promotion
    if (to.row === KING_ROW[piece.color]) {
      checkers[checkerIndex].isKing = true;
      board[to.row][to.col].checker!.isKing = true;
    }
  }
  
  const moveType: MoveType = canCapture(gameState, from, to) ? 'CAPTURE' : 'MOVE';
  const capturedPieces: Checker[] = [];
  
  // Handle capture
  if (moveType === 'CAPTURE') {
    const midRow = from.row + (to.row - from.row) / 2;
    const midCol = from.col + (to.col - from.col) / 2;
    const capturedPiece = board[midRow][midCol].checker;
    
    if (capturedPiece) {
      board[midRow][midCol].checker = null;
      capturedPieces.push(capturedPiece);
      
      // Remove captured piece from checkers array
      const capturedIndex = checkers.findIndex(c => c.id === capturedPiece.id);
      if (capturedIndex !== -1) {
        checkers.splice(capturedIndex, 1);
      }
    }
  }
  
  // Create move record
  const move: Move = {
    id: `move-${Date.now()}`,
    from,
    to,
    type: moveType,
    piece,
    capturedPieces,
    timestamp: Date.now()
  };
  
  newGameState.moveHistory.push(move);
  newGameState.lastMove = move;
  newGameState.moveCount++;
  
  // Switch players
  newGameState.currentPlayer = newGameState.currentPlayer === 'RED' ? 'BLACK' : 'RED';
  
  // Clear selection
  newGameState.selectedPiece = null;
  newGameState.validMoves = [];
  
  // Check for win condition
  const redPieces = checkers.filter(c => c.color === 'RED');
  const blackPieces = checkers.filter(c => c.color === 'BLACK');
  
  if (redPieces.length === 0) {
    newGameState.gameStatus = 'BLACK_WINS';
    newGameState.winner = 'BLACK';
  } else if (blackPieces.length === 0) {
    newGameState.gameStatus = 'RED_WINS';
    newGameState.winner = 'RED';
  }
  
  return newGameState;
}

export function selectPiece(gameState: GameState, position: Position): GameState {
  const newGameState = { ...gameState };
  const piece = newGameState.board[position.row][position.col].checker;
  
  if (piece && piece.color === newGameState.currentPlayer) {
    newGameState.selectedPiece = position;
    newGameState.validMoves = getValidMoves(newGameState, position);
    
    // Update board to show valid moves
    newGameState.board.forEach(row => {
      row.forEach(cell => {
        cell.isValidMove = newGameState.validMoves.some(
          move => move.row === cell.position.row && move.col === cell.position.col
        );
      });
    });
  } else {
    newGameState.selectedPiece = null;
    newGameState.validMoves = [];
    
    // Clear valid move indicators
    newGameState.board.forEach(row => {
      row.forEach(cell => {
        cell.isValidMove = false;
      });
    });
  }
  
  return newGameState;
}

export function makeMove(gameState: GameState, to: Position): GameState {
  if (!gameState.selectedPiece) return gameState;
  
  const isValidMove = gameState.validMoves.some(
    move => move.row === to.row && move.col === to.col
  );
  
  if (!isValidMove) return gameState;
  
  return applyMove(gameState, gameState.selectedPiece, to);
}