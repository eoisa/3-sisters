import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { GameState } from '../types';
import {
  gameReducer,
  initialGameState,
  getAIDecision,
  getAIThinkingTime,
  getAIPlayerName,
  hasThreesInHand,
} from '../game';
import type { AIDifficulty } from '../game';

interface UseSinglePlayerGameProps {
  playerName: string;
  aiCount: number;
  difficulty: AIDifficulty;
}

export function useSinglePlayerGame({ playerName, aiCount, difficulty }: UseSinglePlayerGameProps) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const aiTimeoutRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  const humanPlayerId = 'player-0';

  // Start the game
  const startGame = useCallback(() => {
    const playerNames = [playerName];
    for (let i = 0; i < aiCount; i++) {
      playerNames.push(getAIPlayerName(i));
    }
    dispatch({ type: 'START_GAME', playerNames });
  }, [playerName, aiCount]);

  // Human player actions
  const playCards = useCallback((cardIds: string[]) => {
    dispatch({ type: 'PLAY_CARDS', playerId: humanPlayerId, cardIds });
  }, []);

  const pickupPyre = useCallback(() => {
    dispatch({ type: 'PICKUP_PYRE', playerId: humanPlayerId });
  }, []);

  const flipFaceDown = useCallback((cardIndex: number) => {
    dispatch({ type: 'FLIP_FACE_DOWN', playerId: humanPlayerId, cardIndex });
  }, []);

  const resetGame = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    dispatch({ type: 'RESET_GAME' });
  }, []);

  // Process AI turn
  const processAITurn = useCallback((currentState: GameState) => {
    if (isProcessingRef.current) return;

    const currentPlayer = currentState.players[currentState.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.id === humanPlayerId) return;
    if (currentState.phase !== 'playing') return;

    isProcessingRef.current = true;

    const thinkingTime = getAIThinkingTime(difficulty);

    aiTimeoutRef.current = window.setTimeout(() => {
      const decision = getAIDecision(currentState, currentPlayer.id, difficulty);

      if (decision.action === 'play' && decision.cardIds) {
        dispatch({ type: 'PLAY_CARDS', playerId: currentPlayer.id, cardIds: decision.cardIds });
      } else if (decision.action === 'pickup') {
        dispatch({ type: 'PICKUP_PYRE', playerId: currentPlayer.id });
      } else if (decision.action === 'flipFaceDown' && decision.faceDownIndex !== undefined) {
        dispatch({ type: 'FLIP_FACE_DOWN', playerId: currentPlayer.id, cardIndex: decision.faceDownIndex });
      }

      isProcessingRef.current = false;
    }, thinkingTime);
  }, [difficulty]);

  // Auto-discard 3s during discarding phase
  useEffect(() => {
    if (state.phase === 'discardingThrees') {
      let allDiscarded = true;
      for (const player of state.players) {
        if (hasThreesInHand(state, player.id)) {
          dispatch({ type: 'DISCARD_THREES', playerId: player.id });
          allDiscarded = false;
          break;
        }
      }

      if (allDiscarded) {
        dispatch({ type: 'FINISH_DISCARDING_THREES' });
      }
    }
  }, [state.phase, state.players, state]);

  // Process AI turns when it's an AI's turn
  useEffect(() => {
    if (state.phase !== 'playing') return;
    if (state.players.length === 0) return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer) return;

    // If it's an AI player's turn, process their turn
    if (currentPlayer.id !== humanPlayerId) {
      processAITurn(state);
    }

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [state.currentPlayerIndex, state.phase, state.players, processAITurn, state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, []);

  const isHumanTurn =
    state.phase === 'playing' &&
    state.players[state.currentPlayerIndex]?.id === humanPlayerId;

  return {
    state,
    humanPlayerId,
    isHumanTurn,
    startGame,
    playCards,
    pickupPyre,
    flipFaceDown,
    resetGame,
  };
}
