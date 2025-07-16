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
    lastMove: null,
    mustContinueCapture: null,
    gameStartTime: null,
    gameTime: 0,
    timerRunning: false,
    isAIEnabled: true,
    aiPlayer: 'BLACK',
    turnTimeLimitEnabled: false,
    turnStartTime: null,
    turnTimeRemaining: 5000
  };
}

export function isValidPosition(position: Position): boolean {
  return position.row >= 0 && position.row < BOARD_SIZE && 
         position.col >= 0 && position.col < BOARD_SIZE;
}

export function getAllPiecesWithCaptures(gameState: GameState): Position[] {
  const { board, currentPlayer, mustContinueCapture } = gameState;
  const piecesWithCaptures: Position[] = [];
  
  // If we must continue capturing, only that piece can move
  if (mustContinueCapture) {
    return [mustContinueCapture];
  }
  
  // Check all pieces of the current player
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = board[row][col];
      if (cell.checker && cell.checker.color === currentPlayer) {
        const position = { row, col };
        const captures = getCaptureMoves(gameState, position);
        if (captures.length > 0) {
          piecesWithCaptures.push(position);
        }
      }
    }
  }
  
  return piecesWithCaptures;
}

export function getCaptureMoves(gameState: GameState, position: Position): Position[] {
  const { board } = gameState;
  const piece = board[position.row][position.col].checker;
  
  if (!piece) {
    return [];
  }
  
  const captureMoves: Position[] = [];
  const directions = piece.isKing ? [-1, 1] : [PLAYER_DIRECTIONS[piece.color]];
  
  directions.forEach(rowDirection => {
    [-1, 1].forEach(colDirection => {
      const newRow = position.row + rowDirection;
      const newCol = position.col + colDirection;
      const newPosition = { row: newRow, col: newCol };
      
      if (isValidPosition(newPosition)) {
        const targetCell = board[newRow][newCol];
        
        if (targetCell.checker && targetCell.checker.color !== piece.color) {
          // Potential capture
          const jumpRow = newRow + rowDirection;
          const jumpCol = newCol + colDirection;
          const jumpPosition = { row: jumpRow, col: jumpCol };
          
          if (isValidPosition(jumpPosition) && !board[jumpRow][jumpCol].checker) {
            captureMoves.push(jumpPosition);
          }
        }
      }
    });
  });
  
  return captureMoves;
}

export function getValidMoves(gameState: GameState, position: Position): Position[] {
  const { board, currentPlayer, mustContinueCapture } = gameState;
  const piece = board[position.row][position.col].checker;
  
  if (!piece || piece.color !== currentPlayer) {
    return [];
  }
  
  // If we must continue after a capture, allow any valid move for that piece
  if (mustContinueCapture) {
    if (position.row !== mustContinueCapture.row || position.col !== mustContinueCapture.col) {
      return [];
    }
    // Return all valid moves (captures and regular moves) for the piece that must continue
    const captureMoves: Position[] = [];
    const regularMoves: Position[] = [];
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
            regularMoves.push(newPosition);
          } else if (targetCell.checker.color !== piece.color) {
            // Potential capture
            const jumpRow = newRow + rowDirection;
            const jumpCol = newCol + colDirection;
            const jumpPosition = { row: jumpRow, col: jumpCol };
            
            if (isValidPosition(jumpPosition) && !board[jumpRow][jumpCol].checker) {
              captureMoves.push(jumpPosition);
            }
          }
        }
      });
    });
    
    // Return all moves - captures and regular moves
    return [...captureMoves, ...regularMoves];
  }
  
  // Check if any pieces can capture - if so, only allow those pieces to move
  const piecesWithCaptures = getAllPiecesWithCaptures(gameState);
  if (piecesWithCaptures.length > 0) {
    // Only allow pieces that can capture to move
    const canThisPieceCapture = piecesWithCaptures.some(
      pos => pos.row === position.row && pos.col === position.col
    );
    if (!canThisPieceCapture) {
      return [];
    }
    // Return only capture moves for this piece
    return getCaptureMoves(gameState, position);
  }
  
  const captureMoves: Position[] = [];
  const regularMoves: Position[] = [];
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
          regularMoves.push(newPosition);
        } else if (targetCell.checker.color !== piece.color) {
          // Potential capture
          const jumpRow = newRow + rowDirection;
          const jumpCol = newCol + colDirection;
          const jumpPosition = { row: jumpRow, col: jumpCol };
          
          if (isValidPosition(jumpPosition) && !board[jumpRow][jumpCol].checker) {
            captureMoves.push(jumpPosition);
          }
        }
      }
    });
  });
  
  // If captures are available, only return captures (mandatory capture rule)
  if (captureMoves.length > 0) {
    return captureMoves;
  }
  
  return regularMoves;
}

export function checkForValidMoves(gameState: GameState, player: Player): boolean {
  const { board } = gameState;
  
  // Check all pieces of the current player
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = board[row][col];
      if (cell.checker && cell.checker.color === player) {
        const validMoves = getValidMoves(gameState, { row, col });
        if (validMoves.length > 0) {
          return true;
        }
      }
    }
  }
  
  return false;
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
  
  // Validate the move is legal
  const validMoves = getValidMoves(gameState, from);
  const isValidMove = validMoves.some(move => move.row === to.row && move.col === to.col);
  if (!isValidMove) return gameState;
  
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
    
    // After a capture, check if player can make additional moves
    newGameState.mustContinueCapture = to;
    newGameState.selectedPiece = to;
    newGameState.validMoves = getValidMoves(newGameState, to);
    
    // If no valid moves are available after capture, end the turn
    if (newGameState.validMoves.length === 0) {
      newGameState.mustContinueCapture = null;
      newGameState.selectedPiece = null;
      newGameState.validMoves = [];
      
      // Create move record for the capture
      const move: Move = {
        id: `move-${Date.now()}`,
        from,
        to,
        type: 'CAPTURE',
        piece,
        capturedPieces,
        timestamp: Date.now()
      };
      
      newGameState.moveHistory.push(move);
      newGameState.lastMove = move;
      newGameState.moveCount++;
      
      // Switch players since no bonus move is possible
      newGameState.currentPlayer = newGameState.currentPlayer === 'RED' ? 'BLACK' : 'RED';
      
      // Clear valid move indicators
      newGameState.board.forEach(row => {
        row.forEach(cell => {
          cell.isValidMove = false;
        });
      });
      
      // Check for win condition
      const redPieces = checkers.filter(c => c.color === 'RED');
      const blackPieces = checkers.filter(c => c.color === 'BLACK');
      
      if (redPieces.length === 0) {
        newGameState.gameStatus = 'BLACK_WINS';
        newGameState.winner = 'BLACK';
        newGameState.timerRunning = false;
      } else if (blackPieces.length === 0) {
        newGameState.gameStatus = 'RED_WINS';
        newGameState.winner = 'RED';
        newGameState.timerRunning = false;
      } else {
        // Check for tie condition - no valid moves available for current player
        const hasValidMoves = checkForValidMoves(newGameState, newGameState.currentPlayer);
        if (!hasValidMoves) {
          newGameState.gameStatus = 'DRAW';
          newGameState.winner = null;
          newGameState.timerRunning = false;
        }
      }
      
      return newGameState;
    }
    
    // Update move type to indicate multi-capture
    const move: Move = {
      id: `move-${Date.now()}`,
      from,
      to,
      type: 'MULTI_CAPTURE',
      piece,
      capturedPieces,
      timestamp: Date.now()
    };
    
    newGameState.moveHistory.push(move);
    newGameState.lastMove = move;
    newGameState.moveCount++;
    
    // Update board to show valid moves
    newGameState.board.forEach(row => {
      row.forEach(cell => {
        cell.isValidMove = newGameState.validMoves.some(
          move => move.row === cell.position.row && move.col === cell.position.col
        );
      });
    });
    
    // Don't switch players - same player continues
    return newGameState;
  } else {
    // Regular move, clear continue capture state
    newGameState.mustContinueCapture = null;
  }
  
  // If this was a move during a mustContinueCapture state (bonus move after capture)
  // and it was a regular move (not another capture), end the turn
  if (gameState.mustContinueCapture && moveType === 'MOVE') {
    newGameState.mustContinueCapture = null;
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
  
  // Clear all valid move indicators on the board
  newGameState.board.forEach(row => {
    row.forEach(cell => {
      cell.isValidMove = false;
    });
  });
  
  // Check for win condition
  const redPieces = checkers.filter(c => c.color === 'RED');
  const blackPieces = checkers.filter(c => c.color === 'BLACK');
  
  if (redPieces.length === 0) {
    newGameState.gameStatus = 'BLACK_WINS';
    newGameState.winner = 'BLACK';
    newGameState.timerRunning = false;
  } else if (blackPieces.length === 0) {
    newGameState.gameStatus = 'RED_WINS';
    newGameState.winner = 'RED';
    newGameState.timerRunning = false;
  } else {
    // Check for tie condition - no valid moves available for current player
    const hasValidMoves = checkForValidMoves(newGameState, newGameState.currentPlayer);
    if (!hasValidMoves) {
      newGameState.gameStatus = 'DRAW';
      newGameState.winner = null;
      newGameState.timerRunning = false;
    }
  }
  
  return newGameState;
}

export function selectPiece(gameState: GameState, position: Position): GameState {
  const newGameState = { ...gameState };
  const piece = newGameState.board[position.row][position.col].checker;
  
  // If we must continue capturing, only allow selecting the specific piece
  if (newGameState.mustContinueCapture) {
    if (position.row === newGameState.mustContinueCapture.row && 
        position.col === newGameState.mustContinueCapture.col) {
      newGameState.selectedPiece = position;
      newGameState.validMoves = getValidMoves(newGameState, position);
    } else {
      // Don't allow selecting other pieces
      return newGameState;
    }
  } else if (piece && piece.color === newGameState.currentPlayer) {
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

// AI Move Logic
export function getAIMove(gameState: GameState): { from: Position; to: Position } | null {
  const { board, currentPlayer, mustContinueCapture } = gameState;
  
  // Get all possible moves for the current player
  const allMoves: { from: Position; to: Position; isCapture: boolean; score: number }[] = [];
  
  // If we must continue capturing, only consider moves from that specific piece
  if (mustContinueCapture) {
    const validMoves = getValidMoves(gameState, mustContinueCapture);
    
    validMoves.forEach(move => {
      const deltaRow = Math.abs(move.row - mustContinueCapture.row);
      const deltaCol = Math.abs(move.col - mustContinueCapture.col);
      const isCapture = deltaRow === 2 && deltaCol === 2;
      
      // Calculate move score
      let score = 0;
      
      // Prefer captures
      if (isCapture) {
        score += 10;
      }
      
      // Prefer moving towards opponent's side
      if (currentPlayer === 'BLACK') {
        score += (7 - move.row); // Move towards row 7 (bottom)
      } else {
        score += move.row; // Move towards row 0 (top)
      }
      
      // Prefer making kings
      if ((currentPlayer === 'BLACK' && move.row === 7) || 
          (currentPlayer === 'RED' && move.row === 0)) {
        score += 5;
      }
      
      // Prefer keeping pieces in center
      const centerDistance = Math.abs(move.col - 3.5);
      score += (3.5 - centerDistance);
      
      allMoves.push({
        from: mustContinueCapture,
        to: move,
        isCapture,
        score
      });
    });
  } else {
    // Normal move - consider all pieces
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = board[row][col];
        if (cell.checker?.color === currentPlayer) {
          const validMoves = getValidMoves(gameState, { row, col });
          
          validMoves.forEach(move => {
            const deltaRow = Math.abs(move.row - row);
            const deltaCol = Math.abs(move.col - col);
            const isCapture = deltaRow === 2 && deltaCol === 2;
            
            // Calculate move score
            let score = 0;
            
            // Prefer captures
            if (isCapture) {
              score += 10;
            }
            
            // Prefer moving towards opponent's side
            if (currentPlayer === 'BLACK') {
              score += (7 - move.row); // Move towards row 7 (bottom)
            } else {
              score += move.row; // Move towards row 0 (top)
            }
            
            // Prefer making kings
            if ((currentPlayer === 'BLACK' && move.row === 7) || 
                (currentPlayer === 'RED' && move.row === 0)) {
              score += 5;
            }
            
            // Prefer keeping pieces in center
            const centerDistance = Math.abs(move.col - 3.5);
            score += (3.5 - centerDistance);
            
            allMoves.push({
              from: { row, col },
              to: move,
              isCapture,
              score
            });
          });
        }
      }
    }
  }
  
  if (allMoves.length === 0) {
    return null;
  }
  
  // Sort by score (highest first)
  allMoves.sort((a, b) => b.score - a.score);
  
  // Add some randomness - pick from top 3 moves
  const topMoves = allMoves.slice(0, Math.min(3, allMoves.length));
  const randomMove = topMoves[Math.floor(Math.random() * topMoves.length)];
  
  return { from: randomMove.from, to: randomMove.to };
}