import { useReducer, useCallback, useEffect, useRef } from "react";
import { GameState, Position } from "@/types/game";
import {
  initializeGameState,
  selectPiece,
  makeMove,
  applyMove,
  getAIMove,
} from "@/utils/gameUtils";

type GameAction =
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

function startNewTurn(state: GameState): GameState {
  return {
    ...state,
    turnStartTime: state.turnTimeLimitEnabled ? Date.now() : null,
    turnTimeRemaining: 5000
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_PIECE": {
      const newState = selectPiece(state, action.payload);
      // Start timer on first piece selection
      if (!state.gameStartTime && !state.timerRunning) {
        return {
          ...newState,
          gameStartTime: Date.now(),
          timerRunning: true,
        };
      }
      return newState;
    }

    case "MAKE_MOVE": {
      const newState = makeMove(state, action.payload);
      // Start new turn timer if the player changed
      if (newState.currentPlayer !== state.currentPlayer) {
        return startNewTurn(newState);
      }
      return newState;
    }

    case "MAKE_DIRECT_MOVE": {
      const newState = applyMove(state, action.payload.from, action.payload.to);
      // Start timer on first drag move
      if (!state.gameStartTime && !state.timerRunning) {
        const timerStarted = {
          ...newState,
          gameStartTime: Date.now(),
          timerRunning: true,
        };
        // Start new turn timer if the player changed
        if (timerStarted.currentPlayer !== state.currentPlayer) {
          return startNewTurn(timerStarted);
        }
        return timerStarted;
      }
      // Start new turn timer if the player changed
      if (newState.currentPlayer !== state.currentPlayer) {
        return startNewTurn(newState);
      }
      return newState;
    }

    case "RESET_GAME":
      return startNewTurn(initializeGameState());

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
      });

    case "MAKE_AI_MOVE": {
      const aiMove = getAIMove(state);
      if (aiMove) {
        const newState = applyMove(state, aiMove.from, aiMove.to);
        // Start new turn timer if the player changed
        if (newState.currentPlayer !== state.currentPlayer) {
          return startNewTurn(newState);
        }
        return newState;
      }
      return state;
    }

    case "TOGGLE_TURN_TIME_LIMIT":
      return startNewTurn({
        ...initializeGameState(),
        isAIEnabled: state.isAIEnabled,
        turnTimeLimitEnabled: action.payload,
      });

    case "START_TURN_TIMER":
      return startNewTurn(state);

    case "UPDATE_TURN_TIMER":
      return {
        ...state,
        turnTimeRemaining: action.payload,
      };

    case "TURN_TIME_EXPIRED": {
      // Forfeit the turn - switch to the other player
      const nextPlayer = state.currentPlayer === 'RED' ? 'BLACK' : 'RED';
      return startNewTurn({
        ...state,
        currentPlayer: nextPlayer,
        selectedPiece: null,
        validMoves: [],
        mustContinueCapture: null,
      });
    }

    default:
      return state;
  }
}

export function useGame() {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    null,
    initializeGameState
  );
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (gameState.timerRunning && gameState.gameStartTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - gameState.gameStartTime!;
        dispatch({ type: "UPDATE_TIMER", payload: elapsed });
      }, 100);
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
  }, [gameState.timerRunning, gameState.gameStartTime]);

  // Turn Timer Effect
  useEffect(() => {
    if (gameState.turnTimeLimitEnabled && gameState.turnStartTime && gameState.gameStatus === 'PLAYING') {
      turnTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - gameState.turnStartTime!;
        const remaining = Math.max(0, 5000 - elapsed);
        
        if (remaining <= 0) {
          dispatch({ type: "TURN_TIME_EXPIRED" });
        } else {
          dispatch({ type: "UPDATE_TURN_TIMER", payload: remaining });
        }
      }, 100);
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
  }, [gameState.turnTimeLimitEnabled, gameState.turnStartTime, gameState.gameStatus]);

  // AI Move Effect
  useEffect(() => {
    if (gameState.isAIEnabled && 
        gameState.currentPlayer === gameState.aiPlayer && 
        gameState.gameStatus === 'PLAYING') {
      
      const aiMoveTimer = setTimeout(() => {
        dispatch({ type: "MAKE_AI_MOVE" });
      }, 1000); // 1 second delay for AI move
      
      return () => clearTimeout(aiMoveTimer);
    }
  }, [gameState.isAIEnabled, gameState.currentPlayer, gameState.aiPlayer, gameState.gameStatus, gameState.mustContinueCapture]);

  const selectPieceHandler = useCallback((position: Position) => {
    dispatch({ type: "SELECT_PIECE", payload: position });
  }, []);

  const makeMoveHandler = useCallback((position: Position) => {
    dispatch({ type: "MAKE_MOVE", payload: position });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  const toggleAI = useCallback((enabled: boolean) => {
    dispatch({ type: "TOGGLE_AI", payload: enabled });
  }, []);

  const toggleTurnTimeLimit = useCallback((enabled: boolean) => {
    dispatch({ type: "TOGGLE_TURN_TIME_LIMIT", payload: enabled });
  }, []);

  const handleDragEnd = useCallback(
    (from: Position, to: Position) => {
      const fromCell = gameState.board[from.row][from.col];

      if (
        fromCell.checker &&
        fromCell.checker.color === gameState.currentPlayer
      ) {
        // Directly apply the move without selecting
        dispatch({ type: "MAKE_DIRECT_MOVE", payload: { from, to } });
      }
    },
    [gameState]
  );

  const handleDragStart = useCallback((position: Position) => {
    // Start timer when first piece is dragged
    if (!gameState.gameStartTime && !gameState.timerRunning) {
      dispatch({ type: "START_TIMER" });
    }
  }, [gameState.gameStartTime, gameState.timerRunning]);

  return {
    gameState,
    selectPiece: selectPieceHandler,
    makeMove: makeMoveHandler,
    resetGame,
    toggleAI,
    toggleTurnTimeLimit,
    handleDragEnd,
    handleDragStart,
  };
}
