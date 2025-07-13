import { useReducer, useCallback } from 'react';
import { GameState, Position } from '@/types/game';
import { initializeGameState, selectPiece, makeMove } from '@/utils/gameUtils';

type GameAction = 
  | { type: 'SELECT_PIECE'; payload: Position }
  | { type: 'MAKE_MOVE'; payload: Position }
  | { type: 'RESET_GAME' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_PIECE':
      return selectPiece(state, action.payload);
    
    case 'MAKE_MOVE':
      return makeMove(state, action.payload);
    
    case 'RESET_GAME':
      return initializeGameState();
    
    default:
      return state;
  }
}

export function useGame() {
  const [gameState, dispatch] = useReducer(gameReducer, null, initializeGameState);
  
  const selectPieceHandler = useCallback((position: Position) => {
    dispatch({ type: 'SELECT_PIECE', payload: position });
  }, []);
  
  const makeMoveHandler = useCallback((position: Position) => {
    dispatch({ type: 'MAKE_MOVE', payload: position });
  }, []);
  
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);
  
  const handleCellClick = useCallback((position: Position) => {
    const cell = gameState.board[position.row][position.col];
    
    if (cell.checker && cell.checker.color === gameState.currentPlayer) {
      // Select piece
      selectPieceHandler(position);
    } else if (cell.isValidMove) {
      // Make move
      makeMoveHandler(position);
    } else {
      // Clear selection
      selectPieceHandler(position);
    }
  }, [gameState, selectPieceHandler, makeMoveHandler]);
  
  return {
    gameState,
    selectPiece: selectPieceHandler,
    makeMove: makeMoveHandler,
    resetGame,
    handleCellClick
  };
}