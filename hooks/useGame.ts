import { useReducer, useCallback } from "react";
import { GameState, Position } from "@/types/game";
import {
  initializeGameState,
  selectPiece,
  makeMove,
  applyMove,
} from "@/utils/gameUtils";

type GameAction =
  | { type: "SELECT_PIECE"; payload: Position }
  | { type: "MAKE_MOVE"; payload: Position }
  | { type: "MAKE_DIRECT_MOVE"; payload: { from: Position; to: Position } }
  | { type: "RESET_GAME" };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_PIECE":
      return selectPiece(state, action.payload);

    case "MAKE_MOVE":
      return makeMove(state, action.payload);

    case "MAKE_DIRECT_MOVE":
      return applyMove(state, action.payload.from, action.payload.to);

    case "RESET_GAME":
      return initializeGameState();

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

  const selectPieceHandler = useCallback((position: Position) => {
    dispatch({ type: "SELECT_PIECE", payload: position });
  }, []);

  const makeMoveHandler = useCallback((position: Position) => {
    dispatch({ type: "MAKE_MOVE", payload: position });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
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

  return {
    gameState,
    selectPiece: selectPieceHandler,
    makeMove: makeMoveHandler,
    resetGame,
    handleDragEnd,
  };
}
