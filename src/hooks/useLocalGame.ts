import { useState, useCallback, useEffect } from 'react';
import { useGameContext } from '../context';
import { hasThreesInHand } from '../game';

export function useLocalGame() {
  const { state, dispatch } = useGameContext();
  const [localPlayerId, setLocalPlayerId] = useState<string>('player-0');
  const [showPassScreen, setShowPassScreen] = useState(false);
  const [pendingPlayerId, setPendingPlayerId] = useState<string | null>(null);

  const startGame = useCallback(
    (playerNames: string[]) => {
      dispatch({ type: 'START_GAME', playerNames });
      setLocalPlayerId('player-0');
    },
    [dispatch]
  );

  const discardThrees = useCallback(
    (playerId: string) => {
      dispatch({ type: 'DISCARD_THREES', playerId });
    },
    [dispatch]
  );

  const finishDiscardingThrees = useCallback(() => {
    dispatch({ type: 'FINISH_DISCARDING_THREES' });
  }, [dispatch]);

  const playCards = useCallback(
    (cardIds: string[]) => {
      dispatch({ type: 'PLAY_CARDS', playerId: localPlayerId, cardIds });
    },
    [dispatch, localPlayerId]
  );

  const playFaceUpCards = useCallback(
    (cardIds: string[]) => {
      dispatch({ type: 'PLAY_FACE_UP_CARDS', playerId: localPlayerId, cardIds });
    },
    [dispatch, localPlayerId]
  );

  const pickupPyre = useCallback(() => {
    dispatch({ type: 'PICKUP_PYRE', playerId: localPlayerId });
  }, [dispatch, localPlayerId]);

  const flipFaceDown = useCallback(
    (cardIndex: number) => {
      dispatch({ type: 'FLIP_FACE_DOWN', playerId: localPlayerId, cardIndex });
    },
    [dispatch, localPlayerId]
  );

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, [dispatch]);

  const switchToPlayer = useCallback((playerId: string) => {
    setLocalPlayerId(playerId);
    setShowPassScreen(false);
    setPendingPlayerId(null);
  }, []);

  const requestPassDevice = useCallback((nextPlayerId: string) => {
    setPendingPlayerId(nextPlayerId);
    setShowPassScreen(true);
  }, []);

  // Auto-discard 3s during discarding phase
  useEffect(() => {
    if (state.phase === 'discardingThrees') {
      // Discard 3s for each player
      let allDiscarded = true;
      for (const player of state.players) {
        if (hasThreesInHand(state, player.id)) {
          discardThrees(player.id);
          allDiscarded = false;
          break;
        }
      }

      // If all 3s discarded, move to playing phase
      if (allDiscarded) {
        finishDiscardingThrees();
      }
    }
  }, [state.phase, state.players, discardThrees, finishDiscardingThrees, state]);

  // Handle turn changes in local game - show pass screen
  useEffect(() => {
    if (state.phase === 'playing' && state.players.length > 0) {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer && currentPlayer.id !== localPlayerId) {
        requestPassDevice(currentPlayer.id);
      }
    }
  }, [state.currentPlayerIndex, state.phase, state.players, localPlayerId, requestPassDevice]);

  return {
    state,
    localPlayerId,
    showPassScreen,
    pendingPlayerId,
    startGame,
    playCards,
    playFaceUpCards,
    pickupPyre,
    flipFaceDown,
    resetGame,
    switchToPlayer,
  };
}
