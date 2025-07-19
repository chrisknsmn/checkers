import {
  initializeBoard,
  initializeCheckers,
  initializeGameState,
  isValidPosition,
  getAllPiecesWithCaptures,
  getCaptureMoves,
  getValidMoves,
  checkForValidMoves,
  canCapture,
  applyMove,
  selectPiece,
  makeMove,
  getAIMove,
  getCompleteAITurn,
} from './gameUtils';
import { GameState, Position, Checker, Player } from '@/types/game';
import { BOARD_SIZE } from '@/constants/game';

describe('gameUtils', () => {
  // ============================================================================
  // BOARD INITIALIZATION TESTS
  // ============================================================================
  
  describe('initializeBoard', () => {
    it('should create an 8x8 board', () => {
      const board = initializeBoard();
      expect(board).toHaveLength(BOARD_SIZE);
      expect(board[0]).toHaveLength(BOARD_SIZE);
      expect(board[7]).toHaveLength(BOARD_SIZE);
    });

    it('should initialize all cells with correct properties', () => {
      const board = initializeBoard();
      
      board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          expect(cell.position).toEqual({ row: rowIndex, col: colIndex });
          expect(cell.checker).toBeNull();
          expect(cell.isValidMove).toBe(false);
          expect(typeof cell.isDark).toBe('boolean');
        });
      });
    });

    it('should set dark squares correctly (alternating pattern)', () => {
      const board = initializeBoard();
      
      board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const expectedDark = (rowIndex + colIndex) % 2 === 1;
          expect(cell.isDark).toBe(expectedDark);
        });
      });
    });
  });

  describe('initializeCheckers', () => {
    it('should create 24 checkers total (12 per player)', () => {
      const checkers = initializeCheckers();
      expect(checkers).toHaveLength(24);
      
      const redCheckers = checkers.filter(c => c.color === 'RED');
      const blackCheckers = checkers.filter(c => c.color === 'BLACK');
      
      expect(redCheckers).toHaveLength(12);
      expect(blackCheckers).toHaveLength(12);
    });

    it('should initialize all checkers as non-kings', () => {
      const checkers = initializeCheckers();
      checkers.forEach(checker => {
        expect(checker.isKing).toBe(false);
      });
    });

    it('should have unique IDs for all checkers', () => {
      const checkers = initializeCheckers();
      const ids = checkers.map(c => c.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(checkers.length);
    });

    it('should place RED checkers on top 3 rows', () => {
      const checkers = initializeCheckers();
      const redCheckers = checkers.filter(c => c.color === 'RED');
      
      redCheckers.forEach(checker => {
        expect(checker.position.row).toBeGreaterThanOrEqual(0);
        expect(checker.position.row).toBeLessThanOrEqual(2);
      });
    });

    it('should place BLACK checkers on bottom 3 rows', () => {
      const checkers = initializeCheckers();
      const blackCheckers = checkers.filter(c => c.color === 'BLACK');
      
      blackCheckers.forEach(checker => {
        expect(checker.position.row).toBeGreaterThanOrEqual(5);
        expect(checker.position.row).toBeLessThanOrEqual(7);
      });
    });

    it('should place all checkers on dark squares only', () => {
      const checkers = initializeCheckers();
      
      checkers.forEach(checker => {
        const { row, col } = checker.position;
        expect((row + col) % 2).toBe(1); // Dark squares
      });
    });
  });

  describe('initializeGameState', () => {
    it('should create a valid initial game state', () => {
      const gameState = initializeGameState();
      
      expect(gameState.board).toHaveLength(BOARD_SIZE);
      expect(gameState.checkers).toHaveLength(24);
      expect(gameState.currentPlayer).toBe('BLACK');
      expect(gameState.selectedPiece).toBeNull();
      expect(gameState.validMoves).toHaveLength(0);
      expect(gameState.moveHistory).toHaveLength(0);
      expect(gameState.moveCount).toBe(0);
      expect(gameState.gameStatus).toBe('PLAYING');
      expect(gameState.winner).toBeNull();
      expect(gameState.forcedCapture).toBe(false);
      expect(gameState.lastMove).toBeNull();
      expect(gameState.mustContinueCapture).toBeNull();
      expect(gameState.gameStartTime).toBeNull();
      expect(gameState.gameTime).toBe(0);
      expect(gameState.timerRunning).toBe(false);
      expect(gameState.isAIEnabled).toBe(true);
      expect(gameState.aiPlayer).toBe('RED');
      expect(gameState.turnTimeLimitEnabled).toBe(false);
      expect(gameState.turnStartTime).toBeNull();
      expect(gameState.turnTimeRemaining).toBe(5000);
    });

    it('should place checkers on the board correctly', () => {
      const gameState = initializeGameState();
      
      // Count pieces on board
      let redPiecesOnBoard = 0;
      let blackPiecesOnBoard = 0;
      
      gameState.board.forEach(row => {
        row.forEach(cell => {
          if (cell.checker) {
            if (cell.checker.color === 'RED') redPiecesOnBoard++;
            else blackPiecesOnBoard++;
          }
        });
      });
      
      expect(redPiecesOnBoard).toBe(12);
      expect(blackPiecesOnBoard).toBe(12);
    });

    it('should have checkers array match board state', () => {
      const gameState = initializeGameState();
      
      gameState.checkers.forEach(checker => {
        const { row, col } = checker.position;
        const boardChecker = gameState.board[row][col].checker;
        
        expect(boardChecker).not.toBeNull();
        expect(boardChecker?.id).toBe(checker.id);
        expect(boardChecker?.color).toBe(checker.color);
        expect(boardChecker?.position).toEqual(checker.position);
        expect(boardChecker?.isKing).toBe(checker.isKing);
      });
    });
  });

  // ============================================================================
  // POSITION VALIDATION TESTS
  // ============================================================================

  describe('isValidPosition', () => {
    it('should return true for valid positions', () => {
      expect(isValidPosition({ row: 0, col: 0 })).toBe(true);
      expect(isValidPosition({ row: 3, col: 4 })).toBe(true);
      expect(isValidPosition({ row: 7, col: 7 })).toBe(true);
    });

    it('should return false for positions out of bounds', () => {
      expect(isValidPosition({ row: -1, col: 0 })).toBe(false);
      expect(isValidPosition({ row: 0, col: -1 })).toBe(false);
      expect(isValidPosition({ row: 8, col: 0 })).toBe(false);
      expect(isValidPosition({ row: 0, col: 8 })).toBe(false);
      expect(isValidPosition({ row: -1, col: -1 })).toBe(false);
      expect(isValidPosition({ row: 8, col: 8 })).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidPosition({ row: 0, col: 7 })).toBe(true);
      expect(isValidPosition({ row: 7, col: 0 })).toBe(true);
      expect(isValidPosition({ row: 7.5, col: 0 })).toBe(false); // Non-integer
    });
  });

  // ============================================================================
  // MOVE VALIDATION TESTS
  // ============================================================================

  describe('getValidMoves', () => {
    it('should return empty array for invalid position', () => {
      const gameState = initializeGameState();
      const invalidPosition = { row: 3, col: 3 }; // Empty square
      
      const moves = getValidMoves(gameState, invalidPosition);
      expect(moves).toHaveLength(0);
    });

    it('should return empty array for opponent piece', () => {
      const gameState = initializeGameState();
      // gameState.currentPlayer is 'RED', try to move BLACK piece
      const blackPiecePosition = { row: 5, col: 0 };
      
      const moves = getValidMoves(gameState, blackPiecePosition);
      expect(moves).toHaveLength(0);
    });

    it('should return valid moves for RED piece in starting position', () => {
      const gameState = initializeGameState();
      const redPiecePosition = { row: 2, col: 1 };
      
      const moves = getValidMoves(gameState, redPiecePosition);
      expect(moves.length).toBeGreaterThan(0);
      
      // All moves should be valid positions
      moves.forEach(move => {
        expect(isValidPosition(move)).toBe(true);
      });
    });

    it('should return valid moves for BLACK piece when it is BLACK turn', () => {
      const gameState = initializeGameState();
      gameState.currentPlayer = 'BLACK';
      const blackPiecePosition = { row: 5, col: 0 };
      
      const moves = getValidMoves(gameState, blackPiecePosition);
      expect(moves.length).toBeGreaterThan(0);
    });

    it('should prioritize capture moves when available', () => {
      const gameState = initializeGameState();
      
      // Create a capture scenario
      // Place RED piece at (3, 2) and BLACK piece at (4, 3)
      const redPiece: Checker = {
        id: 'test-red',
        color: 'RED',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      const blackPiece: Checker = {
        id: 'test-black',
        color: 'BLACK',
        position: { row: 4, col: 3 },
        isKing: false
      };
      
      // Clear the board and place our test pieces
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      gameState.board[3][2].checker = redPiece;
      gameState.board[4][3].checker = blackPiece;
      gameState.checkers = [redPiece, blackPiece];
      gameState.currentPlayer = 'RED';
      
      const moves = getValidMoves(gameState, { row: 3, col: 2 });
      
      // Should include capture move to (5, 4)
      expect(moves.some(move => move.row === 5 && move.col === 4)).toBe(true);
    });

    it('should handle mustContinueCapture constraint', () => {
      const gameState = initializeGameState();
      gameState.mustContinueCapture = { row: 2, col: 1 };
      
      // Should only allow moves from the specified position
      const moves = getValidMoves(gameState, { row: 2, col: 3 });
      expect(moves).toHaveLength(0);
      
      const continueMoves = getValidMoves(gameState, { row: 2, col: 1 });
      expect(continueMoves.length).toBeGreaterThanOrEqual(0);
    });

    it('should prioritize capture moves during mustContinueCapture', () => {
      const gameState = initializeGameState();
      
      // Create a multi-capture scenario
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      const redPiece: Checker = {
        id: 'test-red',
        color: 'RED',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      const blackPiece1: Checker = {
        id: 'test-black-1',
        color: 'BLACK',
        position: { row: 4, col: 3 },
        isKing: false
      };
      
      const blackPiece2: Checker = {
        id: 'test-black-2',
        color: 'BLACK',
        position: { row: 2, col: 1 },
        isKing: false
      };
      
      gameState.board[3][2].checker = redPiece;
      gameState.board[4][3].checker = blackPiece1;
      gameState.board[2][1].checker = blackPiece2;
      gameState.checkers = [redPiece, blackPiece1, blackPiece2];
      gameState.currentPlayer = 'RED';
      gameState.mustContinueCapture = { row: 3, col: 2 };
      
      const moves = getValidMoves(gameState, { row: 3, col: 2 });
      
      // Should only return capture moves, not regular moves
      expect(moves.length).toBeGreaterThan(0);
      
      // Verify all returned moves are captures
      moves.forEach(move => {
        expect(Math.abs(move.row - 3)).toBe(2);
        expect(Math.abs(move.col - 2)).toBe(2);
      });
    });
  });

  describe('canCapture', () => {
    it('should return false for non-capture moves', () => {
      const gameState = initializeGameState();
      const from = { row: 2, col: 1 };
      const to = { row: 3, col: 2 };
      
      expect(canCapture(gameState, from, to)).toBe(false);
    });

    it('should return true for valid capture moves', () => {
      const gameState = initializeGameState();
      
      // Create a capture scenario
      const redPiece: Checker = {
        id: 'test-red',
        color: 'RED',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      const blackPiece: Checker = {
        id: 'test-black',
        color: 'BLACK',
        position: { row: 4, col: 3 },
        isKing: false
      };
      
      // Clear the board and place our test pieces
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      gameState.board[3][2].checker = redPiece;
      gameState.board[4][3].checker = blackPiece;
      
      const from = { row: 3, col: 2 };
      const to = { row: 5, col: 4 };
      
      expect(canCapture(gameState, from, to)).toBe(true);
    });

    it('should return false when no enemy piece in between', () => {
      const gameState = initializeGameState();
      
      // Clear the board
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      const redPiece: Checker = {
        id: 'test-red',
        color: 'RED',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      gameState.board[3][2].checker = redPiece;
      
      const from = { row: 3, col: 2 };
      const to = { row: 5, col: 4 };
      
      expect(canCapture(gameState, from, to)).toBe(false);
    });

    it('should return false when friendly piece in between', () => {
      const gameState = initializeGameState();
      
      // Clear the board
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      const redPiece1: Checker = {
        id: 'test-red-1',
        color: 'RED',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      const redPiece2: Checker = {
        id: 'test-red-2',
        color: 'RED',
        position: { row: 4, col: 3 },
        isKing: false
      };
      
      gameState.board[3][2].checker = redPiece1;
      gameState.board[4][3].checker = redPiece2;
      
      const from = { row: 3, col: 2 };
      const to = { row: 5, col: 4 };
      
      expect(canCapture(gameState, from, to)).toBe(false);
    });
  });

  describe('getAllPiecesWithCaptures', () => {
    it('should return empty array when no captures available', () => {
      const gameState = initializeGameState();
      const piecesWithCaptures = getAllPiecesWithCaptures(gameState);
      expect(piecesWithCaptures).toHaveLength(0);
    });

    it('should return mustContinueCapture position when set', () => {
      const gameState = initializeGameState();
      const continuePosition = { row: 3, col: 2 };
      gameState.mustContinueCapture = continuePosition;
      
      const piecesWithCaptures = getAllPiecesWithCaptures(gameState);
      expect(piecesWithCaptures).toHaveLength(1);
      expect(piecesWithCaptures[0]).toEqual(continuePosition);
    });

    it('should find pieces with capture opportunities', () => {
      const gameState = initializeGameState();
      
      // Create a capture scenario
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      const redPiece: Checker = {
        id: 'test-red',
        color: 'RED',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      const blackPiece: Checker = {
        id: 'test-black',
        color: 'BLACK',
        position: { row: 4, col: 3 },
        isKing: false
      };
      
      gameState.board[3][2].checker = redPiece;
      gameState.board[4][3].checker = blackPiece;
      gameState.checkers = [redPiece, blackPiece];
      gameState.currentPlayer = 'RED';
      
      const piecesWithCaptures = getAllPiecesWithCaptures(gameState);
      expect(piecesWithCaptures.length).toBeGreaterThan(0);
      expect(piecesWithCaptures).toContainEqual({ row: 3, col: 2 });
    });
  });

  describe('getCaptureMoves', () => {
    it('should return empty array for position with no checker', () => {
      const gameState = initializeGameState();
      const emptyPosition = { row: 3, col: 3 };
      
      const captureMoves = getCaptureMoves(gameState, emptyPosition);
      expect(captureMoves).toHaveLength(0);
    });

    it('should return capture moves when available', () => {
      const gameState = initializeGameState();
      
      // Create a capture scenario
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      const redPiece: Checker = {
        id: 'test-red',
        color: 'RED',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      const blackPiece: Checker = {
        id: 'test-black',
        color: 'BLACK',
        position: { row: 4, col: 3 },
        isKing: false
      };
      
      gameState.board[3][2].checker = redPiece;
      gameState.board[4][3].checker = blackPiece;
      
      const captureMoves = getCaptureMoves(gameState, { row: 3, col: 2 });
      expect(captureMoves.length).toBeGreaterThan(0);
      expect(captureMoves).toContainEqual({ row: 5, col: 4 });
    });
  });

  describe('checkForValidMoves', () => {
    it('should return true for initial game state', () => {
      const gameState = initializeGameState();
      expect(checkForValidMoves(gameState)).toBe(true);
    });

    it('should return false when no valid moves available', () => {
      const gameState = initializeGameState();
      
      // Clear the board to simulate no moves
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      gameState.checkers = [];
      
      expect(checkForValidMoves(gameState)).toBe(false);
    });

    it('should check moves for both players', () => {
      const gameState = initializeGameState();
      
      // Create a scenario where only one player has pieces
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      const redPiece: Checker = {
        id: 'test-red',
        color: 'RED',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      gameState.board[3][2].checker = redPiece;
      gameState.checkers = [redPiece];
      
      expect(checkForValidMoves(gameState)).toBe(true);
    });
  });

  // ============================================================================
  // GAME STATE MANIPULATION TESTS
  // ============================================================================

  describe('selectPiece', () => {
    it('should select a piece and show valid moves', () => {
      const gameState = initializeGameState();
      const piecePosition = { row: 2, col: 1 };
      
      const newState = selectPiece(gameState, piecePosition);
      
      expect(newState.selectedPiece).toEqual(piecePosition);
      expect(newState.validMoves.length).toBeGreaterThan(0);
    });

    it('should clear selection when selecting empty square', () => {
      const gameState = initializeGameState();
      gameState.selectedPiece = { row: 2, col: 1 };
      
      const newState = selectPiece(gameState, { row: 3, col: 3 });
      
      expect(newState.selectedPiece).toBeNull();
      expect(newState.validMoves).toHaveLength(0);
    });

    it('should not select opponent piece', () => {
      const gameState = initializeGameState();
      const blackPiecePosition = { row: 5, col: 0 };
      
      const newState = selectPiece(gameState, blackPiecePosition);
      
      expect(newState.selectedPiece).toBeNull();
      expect(newState.validMoves).toHaveLength(0);
    });

    it('should respect mustContinueCapture constraint', () => {
      const gameState = initializeGameState();
      gameState.mustContinueCapture = { row: 2, col: 1 };
      
      // Try to select a different piece
      const newState = selectPiece(gameState, { row: 2, col: 3 });
      
      expect(newState.selectedPiece).toBeNull();
    });
  });

  describe('makeMove', () => {
    it('should return original state when no piece selected', () => {
      const gameState = initializeGameState();
      const to = { row: 3, col: 2 };
      
      const newState = makeMove(gameState, to);
      
      expect(newState).toBe(gameState);
    });

    it('should return original state for invalid move', () => {
      const gameState = initializeGameState();
      gameState.selectedPiece = { row: 2, col: 1 };
      gameState.validMoves = [{ row: 3, col: 2 }];
      
      const newState = makeMove(gameState, { row: 4, col: 4 }); // Invalid move
      
      expect(newState).toBe(gameState);
    });

    it('should execute valid move', () => {
      const gameState = initializeGameState();
      const from = { row: 2, col: 1 };
      gameState.selectedPiece = from;
      gameState.validMoves = [{ row: 3, col: 2 }];
      
      const newState = makeMove(gameState, { row: 3, col: 2 });
      
      expect(newState).not.toBe(gameState);
      expect(newState.moveCount).toBe(1);
    });
  });

  describe('applyMove', () => {
    it('should return original state for invalid move', () => {
      const gameState = initializeGameState();
      const from = { row: 2, col: 1 };
      const to = { row: 6, col: 6 }; // Invalid move
      
      const newState = applyMove(gameState, from, to);
      
      expect(newState).toBe(gameState);
    });

    it('should move piece to new position', () => {
      const gameState = initializeGameState();
      const from = { row: 2, col: 1 };
      const to = { row: 3, col: 2 };
      
      const newState = applyMove(gameState, from, to);
      
      expect(newState.board[from.row][from.col].checker).toBeNull();
      expect(newState.board[to.row][to.col].checker).not.toBeNull();
      expect(newState.board[to.row][to.col].checker?.color).toBe('RED');
    });

    it('should switch players after move', () => {
      const gameState = initializeGameState();
      const from = { row: 2, col: 1 };
      const to = { row: 3, col: 2 };
      
      const newState = applyMove(gameState, from, to);
      
      expect(newState.currentPlayer).toBe('BLACK');
    });

    it('should increment move count', () => {
      const gameState = initializeGameState();
      const from = { row: 2, col: 1 };
      const to = { row: 3, col: 2 };
      
      const newState = applyMove(gameState, from, to);
      
      expect(newState.moveCount).toBe(1);
    });

    it('should promote piece to king when reaching end', () => {
      const gameState = initializeGameState();
      
      // Clear board and place RED piece near BLACK end
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      const redPiece: Checker = {
        id: 'test-red',
        color: 'RED',
        position: { row: 6, col: 1 },
        isKing: false
      };
      
      gameState.board[6][1].checker = redPiece;
      gameState.checkers = [redPiece];
      gameState.currentPlayer = 'RED';
      
      const newState = applyMove(gameState, { row: 6, col: 1 }, { row: 7, col: 2 });
      
      expect(newState.board[7][2].checker?.isKing).toBe(true);
    });

    it('should handle capture moves', () => {
      const gameState = initializeGameState();
      
      // Create a capture scenario
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      const redPiece: Checker = {
        id: 'test-red',
        color: 'RED',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      const blackPiece: Checker = {
        id: 'test-black',
        color: 'BLACK',
        position: { row: 4, col: 3 },
        isKing: false
      };
      
      gameState.board[3][2].checker = redPiece;
      gameState.board[4][3].checker = blackPiece;
      gameState.checkers = [redPiece, blackPiece];
      gameState.currentPlayer = 'RED';
      
      const newState = applyMove(gameState, { row: 3, col: 2 }, { row: 5, col: 4 });
      
      expect(newState.board[4][3].checker).toBeNull(); // Captured piece removed
      expect(newState.checkers).toHaveLength(1); // One piece captured
      expect(newState.moveHistory).toHaveLength(1);
      expect(newState.moveHistory[0].type).toBe('CAPTURE');
    });

    it('should handle multi-capture scenarios', () => {
      const gameState = initializeGameState();
      
      // Create multi-capture scenario
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      const redPiece: Checker = {
        id: 'test-red',
        color: 'RED',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      const blackPiece1: Checker = {
        id: 'test-black-1',
        color: 'BLACK',
        position: { row: 4, col: 3 },
        isKing: false
      };
      
      const blackPiece2: Checker = {
        id: 'test-black-2',
        color: 'BLACK',
        position: { row: 6, col: 5 },
        isKing: false
      };
      
      gameState.board[3][2].checker = redPiece;
      gameState.board[4][3].checker = blackPiece1;
      gameState.board[6][5].checker = blackPiece2;
      gameState.checkers = [redPiece, blackPiece1, blackPiece2];
      gameState.currentPlayer = 'RED';
      
      const newState = applyMove(gameState, { row: 3, col: 2 }, { row: 5, col: 4 });
      
      // Should set mustContinueCapture for multi-capture
      expect(newState.mustContinueCapture).toEqual({ row: 5, col: 4 });
      expect(newState.currentPlayer).toBe('RED'); // Same player continues
    });
  });

  // ============================================================================
  // AI TESTS
  // ============================================================================

  describe('getAIMove', () => {
    it('should return null when no moves available', () => {
      const gameState = initializeGameState();
      
      // Clear board
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      gameState.checkers = [];
      gameState.currentPlayer = 'BLACK';
      
      const aiMove = getAIMove(gameState);
      expect(aiMove).toBeNull();
    });

    it('should return a valid move when moves available', () => {
      const gameState = initializeGameState();
      gameState.currentPlayer = 'BLACK';
      
      const aiMove = getAIMove(gameState);
      
      if (aiMove) {
        expect(isValidPosition(aiMove.from)).toBe(true);
        expect(isValidPosition(aiMove.to)).toBe(true);
        expect(gameState.board[aiMove.from.row][aiMove.from.col].checker?.color).toBe('BLACK');
      }
    });

    it('should prefer capture moves', () => {
      const gameState = initializeGameState();
      
      // Create a capture scenario for BLACK
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      const blackPiece: Checker = {
        id: 'test-black',
        color: 'BLACK',
        position: { row: 4, col: 3 },
        isKing: false
      };
      
      const redPiece: Checker = {
        id: 'test-red',
        color: 'RED',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      gameState.board[4][3].checker = blackPiece;
      gameState.board[3][2].checker = redPiece;
      gameState.checkers = [blackPiece, redPiece];
      gameState.currentPlayer = 'BLACK';
      
      const aiMove = getAIMove(gameState);
      
      if (aiMove) {
        expect(aiMove.from).toEqual({ row: 4, col: 3 });
        expect(aiMove.to).toEqual({ row: 2, col: 1 });
      }
    });

    it('should handle mustContinueCapture constraint', () => {
      const gameState = initializeGameState();
      gameState.currentPlayer = 'BLACK';
      gameState.mustContinueCapture = { row: 4, col: 3 };
      
      // Create a piece at the mustContinueCapture position
      const blackPiece: Checker = {
        id: 'test-black',
        color: 'BLACK',
        position: { row: 4, col: 3 },
        isKing: false
      };
      
      gameState.board[4][3].checker = blackPiece;
      
      const aiMove = getAIMove(gameState);
      
      if (aiMove) {
        expect(aiMove.from).toEqual({ row: 4, col: 3 });
      }
    });
  });

  describe('getCompleteAITurn', () => {
    it('should return original state when no mustContinueCapture', () => {
      const gameState = initializeGameState();
      gameState.currentPlayer = 'BLACK';
      gameState.mustContinueCapture = null;
      
      const result = getCompleteAITurn(gameState);
      
      expect(result).toBe(gameState);
    });

    it('should continue making moves while mustContinueCapture is set', () => {
      const gameState = initializeGameState();
      
      // Create a multi-capture scenario
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      
      const blackPiece: Checker = {
        id: 'test-black',
        color: 'BLACK',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      const redPiece1: Checker = {
        id: 'test-red-1',
        color: 'RED',
        position: { row: 4, col: 3 },
        isKing: false
      };
      
      const redPiece2: Checker = {
        id: 'test-red-2',
        color: 'RED',
        position: { row: 6, col: 5 },
        isKing: false
      };
      
      gameState.board[3][2].checker = blackPiece;
      gameState.board[4][3].checker = redPiece1;
      gameState.board[6][5].checker = redPiece2;
      gameState.checkers = [blackPiece, redPiece1, redPiece2];
      gameState.currentPlayer = 'BLACK';
      gameState.aiPlayer = 'RED';
      gameState.mustContinueCapture = { row: 3, col: 2 };
      
      const result = getCompleteAITurn(gameState);
      
      // Should have made at least one move
      expect(result.moveCount).toBeGreaterThan(gameState.moveCount);
      // Should have cleared mustContinueCapture when no more moves available
      expect(result.mustContinueCapture).toBeNull();
    });

    it('should stop when AI player changes', () => {
      const gameState = initializeGameState();
      gameState.currentPlayer = 'BLACK';
      gameState.aiPlayer = 'RED';
      gameState.mustContinueCapture = { row: 3, col: 2 };
      
      // Mock a scenario where the turn ends
      const blackPiece: Checker = {
        id: 'test-black',
        color: 'BLACK',
        position: { row: 3, col: 2 },
        isKing: false
      };
      
      gameState.board[3][2].checker = blackPiece;
      gameState.checkers = [blackPiece];
      
      const result = getCompleteAITurn(gameState);
      
      // Should have processed the state
      expect(result).toBeDefined();
    });

    it('should handle game ending during AI turn', () => {
      const gameState = initializeGameState();
      gameState.currentPlayer = 'BLACK';
      gameState.aiPlayer = 'RED';
      gameState.gameStatus = 'RED_WINS';
      gameState.mustContinueCapture = { row: 3, col: 2 };
      
      const result = getCompleteAITurn(gameState);
      
      // Should stop when game is not playing
      expect(result).toBe(gameState);
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle empty board gracefully', () => {
      const gameState = initializeGameState();
      
      // Clear everything
      gameState.board.forEach(row => {
        row.forEach(cell => {
          cell.checker = null;
        });
      });
      gameState.checkers = [];
      
      expect(() => {
        getValidMoves(gameState, { row: 0, col: 0 });
        getAllPiecesWithCaptures(gameState);
        checkForValidMoves(gameState);
        getAIMove(gameState);
      }).not.toThrow();
    });

    it('should handle king pieces correctly', () => {
      const gameState = initializeGameState();
      
      // Create a king piece
      const kingPiece: Checker = {
        id: 'test-king',
        color: 'RED',
        position: { row: 4, col: 3 },
        isKing: true
      };
      
      gameState.board[4][3].checker = kingPiece;
      gameState.checkers = [kingPiece];
      
      const moves = getValidMoves(gameState, { row: 4, col: 3 });
      
      // King should be able to move in all directions
      expect(moves.length).toBeGreaterThan(0);
    });

    it('should handle boundary conditions', () => {
      const gameState = initializeGameState();
      
      // Test piece at board edge
      const edgePiece: Checker = {
        id: 'test-edge',
        color: 'RED',
        position: { row: 0, col: 1 },
        isKing: false
      };
      
      gameState.board[0][1].checker = edgePiece;
      
      const moves = getValidMoves(gameState, { row: 0, col: 1 });
      
      // Should not return invalid positions
      moves.forEach(move => {
        expect(isValidPosition(move)).toBe(true);
      });
    });
  });
});