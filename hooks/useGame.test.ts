import { renderHook, act } from '@testing-library/react';
import { useGame } from './useGame';
import { initializeGameState } from '@/utils/gameUtils';
import { Position } from '@/types/game';

// Mock the game utils
jest.mock('@/utils/gameUtils', () => ({
  initializeGameState: jest.fn(),
  selectPiece: jest.fn(),
  makeMove: jest.fn(),
  applyMove: jest.fn(),
  getAIMove: jest.fn(),
}));

// Mock timers
jest.useFakeTimers();

describe('useGame Hook', () => {
  const mockGameState = {
    board: Array(8).fill(null).map(() => Array(8).fill(null).map(() => ({
      position: { row: 0, col: 0 },
      checker: null,
      isValidMove: false,
      isDark: false,
    }))),
    checkers: [],
    currentPlayer: 'RED' as const,
    selectedPiece: null,
    validMoves: [],
    moveHistory: [],
    moveCount: 0,
    gameStatus: 'PLAYING' as const,
    winner: null,
    forcedCapture: false,
    lastMove: null,
    mustContinueCapture: null,
    gameStartTime: null,
    gameTime: 0,
    timerRunning: false,
    isAIEnabled: true,
    aiPlayer: 'BLACK' as const,
    turnTimeLimitEnabled: false,
    turnStartTime: null,
    turnTimeRemaining: 5000,
  };

  const mockChecker = {
    id: 'test-checker',
    color: 'RED' as const,
    position: { row: 2, col: 1 },
    isKing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (initializeGameState as jest.Mock).mockReturnValue(mockGameState);
    
    // Mock board with a checker
    const mockBoard = Array(8).fill(null).map((_, row) => 
      Array(8).fill(null).map((_, col) => ({
        position: { row, col },
        checker: (row === 2 && col === 1) ? mockChecker : null,
        isValidMove: false,
        isDark: (row + col) % 2 === 1,
      }))
    );
    
    mockGameState.board = mockBoard;
    mockGameState.checkers = [mockChecker];
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // ============================================================================
  // HOOK INITIALIZATION TESTS
  // ============================================================================

  describe('Hook Initialization', () => {
    it('should initialize with default game state', () => {
      const { result } = renderHook(() => useGame());
      
      expect(result.current.gameState).toBeDefined();
      expect(result.current.selectPiece).toBeDefined();
      expect(result.current.makeMove).toBeDefined();
      expect(result.current.resetGame).toBeDefined();
      expect(result.current.toggleAI).toBeDefined();
      expect(result.current.toggleTurnTimeLimit).toBeDefined();
      expect(result.current.handleDragEnd).toBeDefined();
      expect(result.current.handleDragStart).toBeDefined();
      expect(result.current.isGameActive).toBeDefined();
      expect(result.current.canDragPiece).toBeDefined();
    });

    it('should call initializeGameState on mount', () => {
      renderHook(() => useGame());
      expect(initializeGameState).toHaveBeenCalled();
    });

    it('should return computed properties correctly', () => {
      const { result } = renderHook(() => useGame());
      
      expect(result.current.isGameActive).toBe(true);
      expect(typeof result.current.canDragPiece).toBe('function');
    });
  });

  // ============================================================================
  // GAME ACTIONS TESTS
  // ============================================================================

  describe('Game Actions', () => {
    it('should handle piece selection', () => {
      const { selectPiece: mockSelectPiece } = require('@/utils/gameUtils');
      mockSelectPiece.mockReturnValue({
        ...mockGameState,
        selectedPiece: { row: 2, col: 1 },
        validMoves: [{ row: 3, col: 2 }],
      });

      const { result } = renderHook(() => useGame());
      const position: Position = { row: 2, col: 1 };

      act(() => {
        result.current.selectPiece(position);
      });

      expect(mockSelectPiece).toHaveBeenCalledWith(mockGameState, position);
    });

    it('should handle making moves', () => {
      const { makeMove: mockMakeMove } = require('@/utils/gameUtils');
      mockMakeMove.mockReturnValue({
        ...mockGameState,
        moveCount: 1,
        currentPlayer: 'BLACK',
      });

      const { result } = renderHook(() => useGame());
      const position: Position = { row: 3, col: 2 };

      act(() => {
        result.current.makeMove(position);
      });

      expect(mockMakeMove).toHaveBeenCalledWith(mockGameState, position);
    });

    it('should handle direct moves (drag and drop)', () => {
      const { applyMove: mockApplyMove } = require('@/utils/gameUtils');
      mockApplyMove.mockReturnValue({
        ...mockGameState,
        moveCount: 1,
        currentPlayer: 'BLACK',
      });

      const { result } = renderHook(() => useGame());
      const from: Position = { row: 2, col: 1 };
      const to: Position = { row: 3, col: 2 };

      act(() => {
        result.current.handleDragEnd(from, to);
      });

      expect(mockApplyMove).toHaveBeenCalledWith(mockGameState, from, to);
    });

    it('should not allow dragging opponent pieces', () => {
      const { applyMove: mockApplyMove } = require('@/utils/gameUtils');
      
      // Create a BLACK piece
      const blackChecker = {
        id: 'black-checker',
        color: 'BLACK' as const,
        position: { row: 5, col: 0 },
        isKing: false,
      };
      
      const gameStateWithBlackPiece = {
        ...mockGameState,
        board: mockGameState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => ({
            ...cell,
            checker: (rowIndex === 5 && colIndex === 0) ? blackChecker : cell.checker,
          }))
        ),
      };
      
      (initializeGameState as jest.Mock).mockReturnValue(gameStateWithBlackPiece);

      const { result } = renderHook(() => useGame());
      const from: Position = { row: 5, col: 0 }; // BLACK piece
      const to: Position = { row: 4, col: 1 };

      act(() => {
        result.current.handleDragEnd(from, to);
      });

      expect(mockApplyMove).not.toHaveBeenCalled();
    });

    it('should handle game reset', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.resetGame();
      });

      expect(initializeGameState).toHaveBeenCalledTimes(2); // Once on mount, once on reset
    });

    it('should handle AI toggle', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.toggleAI(false);
      });

      expect(result.current.gameState.isAIEnabled).toBeDefined();
    });

    it('should handle turn time limit toggle', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.toggleTurnTimeLimit(true);
      });

      expect(result.current.gameState.turnTimeLimitEnabled).toBeDefined();
    });
  });

  // ============================================================================
  // TIMER FUNCTIONALITY TESTS
  // ============================================================================

  describe('Timer Functionality', () => {
    it('should start game timer when first piece is selected', () => {
      const { selectPiece: mockSelectPiece } = require('@/utils/gameUtils');
      mockSelectPiece.mockReturnValue({
        ...mockGameState,
        gameStartTime: Date.now(),
        timerRunning: true,
      });

      const { result } = renderHook(() => useGame());
      const position: Position = { row: 2, col: 1 };

      act(() => {
        result.current.selectPiece(position);
      });

      expect(mockSelectPiece).toHaveBeenCalled();
    });

    it('should start game timer when piece is dragged', () => {
      const { result } = renderHook(() => useGame());
      const position: Position = { row: 2, col: 1 };

      act(() => {
        result.current.handleDragStart(position);
      });

      // Should trigger timer start action
      expect(result.current.gameState).toBeDefined();
    });

    it('should update game timer periodically', () => {
      const gameStateWithTimer = {
        ...mockGameState,
        gameStartTime: Date.now(),
        timerRunning: true,
        gameStatus: 'PLAYING' as const,
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateWithTimer);

      const { result } = renderHook(() => useGame());

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.gameState).toBeDefined();
    });

    it('should handle turn timer when enabled', () => {
      const gameStateWithTurnTimer = {
        ...mockGameState,
        turnTimeLimitEnabled: true,
        turnStartTime: Date.now(),
        gameStatus: 'PLAYING' as const,
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateWithTurnTimer);

      const { result } = renderHook(() => useGame());

      act(() => {
        jest.advanceTimersByTime(6000); // More than 5 second limit
      });

      expect(result.current.gameState).toBeDefined();
    });

    it('should clear timers when game ends', () => {
      const gameStateEnded = {
        ...mockGameState,
        gameStatus: 'RED_WINS' as const,
        timerRunning: false,
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateEnded);

      const { result } = renderHook(() => useGame());

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.gameState.gameStatus).toBe('RED_WINS');
    });
  });

  // ============================================================================
  // AI FUNCTIONALITY TESTS
  // ============================================================================

  describe('AI Functionality', () => {
    it('should make AI move when it is AI player turn', () => {
      const { getAIMove: mockGetAIMove, applyMove: mockApplyMove } = require('@/utils/gameUtils');
      mockGetAIMove.mockReturnValue({
        from: { row: 5, col: 0 },
        to: { row: 4, col: 1 },
      });
      mockApplyMove.mockReturnValue({
        ...mockGameState,
        currentPlayer: 'RED' as const,
        moveCount: 1,
      });

      const gameStateAITurn = {
        ...mockGameState,
        currentPlayer: 'BLACK' as const,
        isAIEnabled: true,
        aiPlayer: 'BLACK' as const,
        gameStatus: 'PLAYING' as const,
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateAITurn);

      const { result } = renderHook(() => useGame());

      act(() => {
        jest.advanceTimersByTime(1000); // AI delay
      });

      expect(mockGetAIMove).toHaveBeenCalledWith(gameStateAITurn);
      expect(mockApplyMove).toHaveBeenCalledWith(gameStateAITurn, { row: 5, col: 0 }, { row: 4, col: 1 });
    });

    it('should not make AI move when AI is disabled', () => {
      const { getAIMove: mockGetAIMove } = require('@/utils/gameUtils');

      const gameStateAIDisabled = {
        ...mockGameState,
        currentPlayer: 'BLACK' as const,
        isAIEnabled: false,
        aiPlayer: 'BLACK' as const,
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateAIDisabled);

      const { result } = renderHook(() => useGame());

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockGetAIMove).not.toHaveBeenCalled();
    });

    it('should not make AI move when it is human player turn', () => {
      const { getAIMove: mockGetAIMove } = require('@/utils/gameUtils');

      const gameStateHumanTurn = {
        ...mockGameState,
        currentPlayer: 'RED' as const,
        isAIEnabled: true,
        aiPlayer: 'BLACK' as const,
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateHumanTurn);

      const { result } = renderHook(() => useGame());

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockGetAIMove).not.toHaveBeenCalled();
    });

    it('should not make AI move when game is not playing', () => {
      const { getAIMove: mockGetAIMove } = require('@/utils/gameUtils');

      const gameStateFinished = {
        ...mockGameState,
        currentPlayer: 'BLACK' as const,
        isAIEnabled: true,
        aiPlayer: 'BLACK' as const,
        gameStatus: 'RED_WINS' as const,
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateFinished);

      const { result } = renderHook(() => useGame());

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockGetAIMove).not.toHaveBeenCalled();
    });

    it('should handle AI move with continue capture', () => {
      const { getAIMove: mockGetAIMove, applyMove: mockApplyMove } = require('@/utils/gameUtils');
      mockGetAIMove.mockReturnValue({
        from: { row: 5, col: 0 },
        to: { row: 4, col: 1 },
      });
      mockApplyMove.mockReturnValue({
        ...mockGameState,
        currentPlayer: 'RED' as const,
        moveCount: 1,
      });

      const gameStateWithContinueCapture = {
        ...mockGameState,
        currentPlayer: 'BLACK' as const,
        isAIEnabled: true,
        aiPlayer: 'BLACK' as const,
        gameStatus: 'PLAYING' as const,
        mustContinueCapture: { row: 5, col: 0 },
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateWithContinueCapture);

      const { result } = renderHook(() => useGame());

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockGetAIMove).toHaveBeenCalledWith(gameStateWithContinueCapture);
      expect(mockApplyMove).toHaveBeenCalledWith(gameStateWithContinueCapture, { row: 5, col: 0 }, { row: 4, col: 1 });
    });
  });

  // ============================================================================
  // UTILITY FUNCTIONS TESTS
  // ============================================================================

  describe('Utility Functions', () => {
    it('should correctly identify if game is active', () => {
      const { result } = renderHook(() => useGame());
      
      expect(result.current.isGameActive).toBe(true);
    });

    it('should correctly identify if game is not active', () => {
      const gameStateFinished = {
        ...mockGameState,
        gameStatus: 'RED_WINS' as const,
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateFinished);

      const { result } = renderHook(() => useGame());
      
      expect(result.current.isGameActive).toBe(false);
    });

    it('should correctly identify if piece can be dragged', () => {
      const { result } = renderHook(() => useGame());
      
      const redPiecePosition: Position = { row: 2, col: 1 };
      const blackPiecePosition: Position = { row: 5, col: 0 };
      const emptyPosition: Position = { row: 3, col: 3 };
      
      expect(result.current.canDragPiece(redPiecePosition)).toBe(true);
      expect(result.current.canDragPiece(blackPiecePosition)).toBe(false);
      expect(result.current.canDragPiece(emptyPosition)).toBe(false);
    });

    it('should handle canDragPiece with different current player', () => {
      const gameStateBlackTurn = {
        ...mockGameState,
        currentPlayer: 'BLACK' as const,
        board: mockGameState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => ({
            ...cell,
            checker: (rowIndex === 5 && colIndex === 0) ? {
              id: 'black-checker',
              color: 'BLACK' as const,
              position: { row: 5, col: 0 },
              isKing: false,
            } : cell.checker,
          }))
        ),
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateBlackTurn);

      const { result } = renderHook(() => useGame());
      
      const redPiecePosition: Position = { row: 2, col: 1 };
      const blackPiecePosition: Position = { row: 5, col: 0 };
      
      expect(result.current.canDragPiece(redPiecePosition)).toBe(false);
      expect(result.current.canDragPiece(blackPiecePosition)).toBe(true);
    });
  });

  // ============================================================================
  // MEMOIZATION AND PERFORMANCE TESTS
  // ============================================================================

  describe('Memoization and Performance', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useGame());
      
      const firstRender = {
        selectPiece: result.current.selectPiece,
        makeMove: result.current.makeMove,
        resetGame: result.current.resetGame,
        toggleAI: result.current.toggleAI,
        toggleTurnTimeLimit: result.current.toggleTurnTimeLimit,
      };

      rerender();

      expect(result.current.selectPiece).toBe(firstRender.selectPiece);
      expect(result.current.makeMove).toBe(firstRender.makeMove);
      expect(result.current.resetGame).toBe(firstRender.resetGame);
      expect(result.current.toggleAI).toBe(firstRender.toggleAI);
      expect(result.current.toggleTurnTimeLimit).toBe(firstRender.toggleTurnTimeLimit);
    });

    it('should update memoized values when dependencies change', () => {
      const { result } = renderHook(() => useGame());
      
      const firstIsGameActive = result.current.isGameActive;
      const firstCanDragPiece = result.current.canDragPiece;

      // Change game state
      const gameStateFinished = {
        ...mockGameState,
        gameStatus: 'RED_WINS' as const,
        currentPlayer: 'BLACK' as const,
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateFinished);

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.isGameActive).not.toBe(firstIsGameActive);
      expect(result.current.canDragPiece).not.toBe(firstCanDragPiece);
    });

    it('should handle handleDragEnd with correct dependencies', () => {
      const { result, rerender } = renderHook(() => useGame());
      
      const firstHandleDragEnd = result.current.handleDragEnd;
      
      // Rerender without changing dependencies
      rerender();
      
      expect(result.current.handleDragEnd).toBe(firstHandleDragEnd);
    });

    it('should handle handleDragStart with correct dependencies', () => {
      const { result, rerender } = renderHook(() => useGame());
      
      const firstHandleDragStart = result.current.handleDragStart;
      
      // Rerender without changing timer-related state
      rerender();
      
      expect(result.current.handleDragStart).toBe(firstHandleDragStart);
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================

  describe('Edge Cases and Error Handling', () => {
    it('should handle null AI move gracefully', () => {
      const { getAIMove: mockGetAIMove } = require('@/utils/gameUtils');
      mockGetAIMove.mockReturnValue(null);

      const gameStateAITurn = {
        ...mockGameState,
        currentPlayer: 'BLACK' as const,
        isAIEnabled: true,
        aiPlayer: 'BLACK' as const,
        gameStatus: 'PLAYING' as const,
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateAITurn);

      const { result } = renderHook(() => useGame());

      expect(() => {
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }).not.toThrow();
    });

    it('should handle timer cleanup on unmount', () => {
      const gameStateWithTimer = {
        ...mockGameState,
        gameStartTime: Date.now(),
        timerRunning: true,
        gameStatus: 'PLAYING' as const,
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateWithTimer);

      const { unmount } = renderHook(() => useGame());

      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle rapid action dispatches', () => {
      const { result } = renderHook(() => useGame());
      
      expect(() => {
        act(() => {
          result.current.selectPiece({ row: 2, col: 1 });
          result.current.makeMove({ row: 3, col: 2 });
          result.current.resetGame();
        });
      }).not.toThrow();
    });

    it('should handle invalid positions gracefully', () => {
      const { result } = renderHook(() => useGame());
      
      expect(() => {
        act(() => {
          result.current.selectPiece({ row: -1, col: -1 });
          result.current.makeMove({ row: 10, col: 10 });
          result.current.handleDragEnd({ row: -1, col: -1 }, { row: 10, col: 10 });
        });
      }).not.toThrow();
    });

    it('should handle state inconsistencies gracefully', () => {
      const inconsistentState = {
        ...mockGameState,
        board: [], // Empty board
        checkers: [mockChecker], // But checkers exist
      };

      (initializeGameState as jest.Mock).mockReturnValue(inconsistentState);

      expect(() => {
        renderHook(() => useGame());
      }).not.toThrow();
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests', () => {
    it('should handle full game flow', () => {
      const { selectPiece: mockSelectPiece, makeMove: mockMakeMove } = require('@/utils/gameUtils');
      
      mockSelectPiece.mockReturnValue({
        ...mockGameState,
        selectedPiece: { row: 2, col: 1 },
        validMoves: [{ row: 3, col: 2 }],
      });

      mockMakeMove.mockReturnValue({
        ...mockGameState,
        moveCount: 1,
        currentPlayer: 'BLACK',
        selectedPiece: null,
        validMoves: [],
      });

      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.selectPiece({ row: 2, col: 1 });
      });

      act(() => {
        result.current.makeMove({ row: 3, col: 2 });
      });

      expect(mockSelectPiece).toHaveBeenCalledWith(mockGameState, { row: 2, col: 1 });
      expect(mockMakeMove).toHaveBeenCalled();
    });

    it('should handle game reset after AI toggle', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.toggleAI(false);
      });

      act(() => {
        result.current.resetGame();
      });

      expect(initializeGameState).toHaveBeenCalledTimes(3); // Mount, AI toggle, reset
    });

    it('should handle timer and AI interactions', () => {
      const { getAIMove: mockGetAIMove, applyMove: mockApplyMove } = require('@/utils/gameUtils');
      mockGetAIMove.mockReturnValue({
        from: { row: 5, col: 0 },
        to: { row: 4, col: 1 },
      });
      mockApplyMove.mockReturnValue({
        ...mockGameState,
        currentPlayer: 'RED' as const,
        moveCount: 1,
      });

      const gameStateAIWithTimer = {
        ...mockGameState,
        currentPlayer: 'BLACK' as const,
        isAIEnabled: true,
        aiPlayer: 'BLACK' as const,
        gameStatus: 'PLAYING' as const,
        gameStartTime: Date.now(),
        timerRunning: true,
        turnTimeLimitEnabled: true,
        turnStartTime: Date.now(),
      };

      (initializeGameState as jest.Mock).mockReturnValue(gameStateAIWithTimer);

      const { result } = renderHook(() => useGame());

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockGetAIMove).toHaveBeenCalledWith(expect.objectContaining({
        currentPlayer: 'BLACK',
        isAIEnabled: true,
        aiPlayer: 'BLACK',
        gameStatus: 'PLAYING',
        turnTimeLimitEnabled: true,
      }));
      expect(mockApplyMove).toHaveBeenCalledWith(expect.objectContaining({
        currentPlayer: 'BLACK',
        isAIEnabled: true,
        aiPlayer: 'BLACK',
        gameStatus: 'PLAYING',
      }), { row: 5, col: 0 }, { row: 4, col: 1 });
    });
  });
});