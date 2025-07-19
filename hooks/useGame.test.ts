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
  getCompleteAITurn: jest.fn(),
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
    currentPlayer: 'BLACK' as const,
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
    aiPlayer: 'RED' as const,
    turnTimeLimitEnabled: false,
    turnStartTime: null,
    turnTimeRemaining: 5000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (initializeGameState as jest.Mock).mockReturnValue(mockGameState);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

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
      currentPlayer: 'RED',
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
      currentPlayer: 'RED',
    });

    const { result } = renderHook(() => useGame());
    const from: Position = { row: 2, col: 1 };
    const to: Position = { row: 3, col: 2 };

    act(() => {
      result.current.handleDragEnd(from, to);
    });

    expect(mockApplyMove).toHaveBeenCalledWith(mockGameState, from, to);
  });

  it('should handle game reset', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.resetGame();
    });

    expect(initializeGameState).toHaveBeenCalledTimes(2); // Once on mount, once on reset
  });

  it('should make AI move when it is AI player turn', () => {
    const { getAIMove: mockGetAIMove, applyMove: mockApplyMove } = require('@/utils/gameUtils');
    mockGetAIMove.mockReturnValue({
      from: { row: 5, col: 0 },
      to: { row: 4, col: 1 },
    });
    mockApplyMove.mockReturnValue({
      ...mockGameState,
      currentPlayer: 'BLACK' as const,
      moveCount: 1,
    });

    const gameStateAITurn = {
      ...mockGameState,
      currentPlayer: 'BLACK' as const,
      isAIEnabled: true,
      aiPlayer: 'RED' as const,
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

  it('should correctly identify if game is active', () => {
    const { result } = renderHook(() => useGame());
    
    expect(result.current.isGameActive).toBe(true);
  });
});