import { useReducer, useCallback, useEffect, useRef, useMemo } from "react";
import { GameState, Position, GameAction } from "@/types/game";
import {
  initializeGameState,
  selectPiece,
  makeMove,
  applyMove,
  getAIMove,
} from "@/utils/gameUtils";

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const GAME_CONFIG = {
  TURN_TIME_LIMIT: 5000,
  AI_DELAY: 1000,
  TIMER_INTERVAL: 100,
} as const;

// ============================================================================
// TYPES AND ACTION CREATORS
// ============================================================================

/**
 * Action creators for better type safety and maintainability
 */
const actionCreators = {
  selectPiece: (position: Position): GameAction => ({
    type: "SELECT_PIECE",
    payload: position,
  }),
  makeMove: (position: Position): GameAction => ({
    type: "MAKE_MOVE",
    payload: position,
  }),
  makeDirectMove: (from: Position, to: Position): GameAction => ({
    type: "MAKE_DIRECT_MOVE",
    payload: { from, to },
  }),
  resetGame: (): GameAction => ({ type: "RESET_GAME" }),
  startTimer: (): GameAction => ({ type: "START_TIMER" }),
  updateTimer: (elapsed: number): GameAction => ({
    type: "UPDATE_TIMER",
    payload: elapsed,
  }),
  toggleAI: (enabled: boolean): GameAction => ({
    type: "TOGGLE_AI",
    payload: enabled,
  }),
  makeAIMove: (): GameAction => ({ type: "MAKE_AI_MOVE" }),
  toggleTurnTimeLimit: (enabled: boolean): GameAction => ({
    type: "TOGGLE_TURN_TIME_LIMIT",
    payload: enabled,
  }),
  startTurnTimer: (): GameAction => ({ type: "START_TURN_TIMER" }),
  updateTurnTimer: (remaining: number): GameAction => ({
    type: "UPDATE_TURN_TIMER",
    payload: remaining,
  }),
  turnTimeExpired: (): GameAction => ({ type: "TURN_TIME_EXPIRED" }),
  startGame: (isAI: boolean): GameAction => ({
    type: "START_GAME",
    payload: { isAI },
  }),
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for managing game and turn timers
 */
function useGameTimers(
  gameState: GameState,
  dispatch: React.Dispatch<GameAction>
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Game timer effect
  useEffect(() => {
    if (
      gameState.timerRunning &&
      gameState.gameStartTime &&
      gameState.gameStatus === "PLAYING"
    ) {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - gameState.gameStartTime!;
        dispatch(actionCreators.updateTimer(elapsed));
      }, GAME_CONFIG.TIMER_INTERVAL);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    gameState.timerRunning,
    gameState.gameStartTime,
    gameState.gameStatus,
    dispatch,
  ]);

  // Turn timer effect
  useEffect(() => {
    if (
      gameState.turnTimeLimitEnabled &&
      gameState.turnStartTime &&
      gameState.gameStatus === "PLAYING"
    ) {
      turnTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - gameState.turnStartTime!;
        const remaining = Math.max(0, GAME_CONFIG.TURN_TIME_LIMIT - elapsed);

        if (remaining <= 0) {
          dispatch(actionCreators.turnTimeExpired());
        } else {
          dispatch(actionCreators.updateTurnTimer(remaining));
        }
      }, GAME_CONFIG.TIMER_INTERVAL);
    } else {
      if (turnTimerRef.current) {
        clearInterval(turnTimerRef.current);
        turnTimerRef.current = null;
      }
    }

    return () => {
      if (turnTimerRef.current) {
        clearInterval(turnTimerRef.current);
        turnTimerRef.current = null;
      }
    };
  }, [
    gameState.turnTimeLimitEnabled,
    gameState.turnStartTime,
    gameState.gameStatus,
    dispatch,
  ]);
}

/**
 * Custom hook for AI player logic
 */
function useAIPlayer(
  gameState: GameState,
  dispatch: React.Dispatch<GameAction>
) {
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const shouldMakeAIMove = (
      gameState.isAIEnabled &&
      gameState.currentPlayer === gameState.aiPlayer &&
      gameState.gameStatus === "PLAYING"
    );
    
    console.log('AI effect triggered:', {
      shouldMakeAIMove,
      isAIEnabled: gameState.isAIEnabled,
      currentPlayer: gameState.currentPlayer,
      aiPlayer: gameState.aiPlayer,
      gameStatus: gameState.gameStatus,
      bonusTurnAfterCapture: gameState.bonusTurnAfterCapture
    });

    // Clear any existing timer
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }

    if (shouldMakeAIMove) {
      console.log('Setting AI move timer...');
      aiTimerRef.current = setTimeout(() => {
        console.log('AI timer fired, dispatching makeAIMove');
        aiTimerRef.current = null;
        dispatch(actionCreators.makeAIMove());
      }, GAME_CONFIG.AI_DELAY);
    }

    return () => {
      if (aiTimerRef.current) {
        console.log('Cleaning up AI timer');
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }
    };
  }, [
    gameState.isAIEnabled,
    gameState.currentPlayer,
    gameState.aiPlayer,
    gameState.gameStatus,
    gameState.bonusTurnAfterCapture,
    gameState.moveCount,
    dispatch
  ]);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper function to start a new turn with proper timer setup
 */
function startNewTurn(state: GameState): GameState {
  return {
    ...state,
    turnStartTime:
      state.turnTimeLimitEnabled && state.gameStartTime ? Date.now() : null,
    turnTimeRemaining: GAME_CONFIG.TURN_TIME_LIMIT,
  };
}

/**
 * Helper function to handle move actions and determine if a new turn should start
 */
function handleMoveAction(
  state: GameState,
  newState: GameState,
  shouldStartTimer: boolean = false
): GameState {
  let result = newState;

  // Start game timer if needed
  if (shouldStartTimer && !state.gameStartTime && !state.timerRunning) {
    result = {
      ...result,
      gameStartTime: Date.now(),
      timerRunning: true,
    };
  }

  // Start new turn timer if player changed or continues after capture
  if (
    result.currentPlayer !== state.currentPlayer ||
    result.mustContinueCapture
  ) {
    result = startNewTurn(result);
  }

  return result;
}

/**
 * Helper function to switch to the next player
 */
function switchToNextPlayer(state: GameState): GameState {
  const nextPlayer = state.currentPlayer === "RED" ? "BLACK" : "RED";
  return startNewTurn({
    ...state,
    currentPlayer: nextPlayer,
    selectedPiece: null,
    validMoves: [],
    mustContinueCapture: null,
  });
}

// ============================================================================
// REDUCER
// ============================================================================

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_PIECE": {
      const newState = selectPiece(state, action.payload);
      return handleMoveAction(state, newState, true);
    }

    case "MAKE_MOVE": {
      const newState = makeMove(state, action.payload);
      return handleMoveAction(state, newState);
    }

    case "MAKE_DIRECT_MOVE": {
      const newState = applyMove(state, action.payload.from, action.payload.to);
      return handleMoveAction(state, newState, true);
    }

    case "RESET_GAME":
      return startNewTurn({
        ...initializeGameState(),
        gameStarted: false,
      });

    case "START_TIMER":
      return startNewTurn({
        ...state,
        gameStartTime: Date.now(),
        timerRunning: true,
      });

    case "UPDATE_TIMER":
      return {
        ...state,
        gameTime: action.payload,
      };

    case "TOGGLE_AI":
      return startNewTurn({
        ...initializeGameState(),
        isAIEnabled: action.payload,
        gameStarted: false,
      });

    case "MAKE_AI_MOVE": {
      console.log('MAKE_AI_MOVE action - current state:', {
        currentPlayer: state.currentPlayer,
        bonusTurnAfterCapture: state.bonusTurnAfterCapture,
        isAIEnabled: state.isAIEnabled,
        aiPlayer: state.aiPlayer
      });
      
      const aiMove = getAIMove(state);
      console.log('AI move result:', aiMove);
      
      if (aiMove) {
        const newState = applyMove(state, aiMove.from, aiMove.to);
        const result = handleMoveAction(state, newState);
        console.log('After AI move - result state:', {
          currentPlayer: result.currentPlayer,
          bonusTurnAfterCapture: result.bonusTurnAfterCapture
        });
        return result;
      }
      return state;
    }

    case "TOGGLE_TURN_TIME_LIMIT":
      return startNewTurn({
        ...initializeGameState(),
        isAIEnabled: state.isAIEnabled,
        turnTimeLimitEnabled: action.payload,
        gameStarted: false,
      });

    case "START_TURN_TIMER":
      return startNewTurn(state);

    case "UPDATE_TURN_TIMER":
      return {
        ...state,
        turnTimeRemaining: action.payload,
      };

    case "TURN_TIME_EXPIRED":
      return switchToNextPlayer(state);

    case "START_GAME":
      return startNewTurn({
        ...initializeGameState(),
        isAIEnabled: action.payload.isAI,
        gameStarted: true,
      });

    default:
      return state;
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Main game hook that manages game state and provides game actions
 * @returns Game state and action handlers
 */
export function useGame() {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    null,
    initializeGameState
  );

  // Initialize custom hooks
  useGameTimers(gameState, dispatch);
  useAIPlayer(gameState, dispatch);

  // Memoized game state properties for performance
  const isGameActive = useMemo(
    () => gameState.gameStatus === "PLAYING",
    [gameState.gameStatus]
  );
  const canDragPiece = useMemo(
    () => (position: Position) => {
      if (
        !position ||
        position.row < 0 ||
        position.row >= 8 ||
        position.col < 0 ||
        position.col >= 8
      ) {
        return false;
      }
      const cell = gameState.board[position.row]?.[position.col];
      return !!(
        cell?.checker && cell.checker.color === gameState.currentPlayer
      );
    },
    [gameState.board, gameState.currentPlayer]
  );

  // Action handlers with proper memoization
  const selectPieceHandler = useCallback((position: Position) => {
    dispatch(actionCreators.selectPiece(position));
  }, []);

  const makeMoveHandler = useCallback((position: Position) => {
    dispatch(actionCreators.makeMove(position));
  }, []);

  const resetGame = useCallback(() => {
    dispatch(actionCreators.resetGame());
  }, []);

  const toggleAI = useCallback((enabled: boolean) => {
    dispatch(actionCreators.toggleAI(enabled));
  }, []);

  const toggleTurnTimeLimit = useCallback((enabled: boolean) => {
    dispatch(actionCreators.toggleTurnTimeLimit(enabled));
  }, []);

  const startGame = useCallback((isAI: boolean) => {
    dispatch(actionCreators.startGame(isAI));
  }, []);

  const handleDragEnd = useCallback(
    (from: Position, to: Position) => {
      if (canDragPiece(from)) {
        dispatch(actionCreators.makeDirectMove(from, to));
      }
    },
    [canDragPiece]
  );

  const handleDragStart = useCallback(
    (position: Position) => {
      // Start timer when first piece is dragged
      if (!gameState.gameStartTime && !gameState.timerRunning) {
        dispatch(actionCreators.startTimer());
      }
    },
    [gameState.gameStartTime, gameState.timerRunning]
  );

  return {
    gameState,
    selectPiece: selectPieceHandler,
    makeMove: makeMoveHandler,
    resetGame,
    toggleAI,
    toggleTurnTimeLimit,
    startGame,
    handleDragEnd,
    handleDragStart,
    isGameActive,
    canDragPiece,
  };
}
