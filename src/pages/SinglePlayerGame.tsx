import { useEffect } from 'react';
import { useSinglePlayerGame } from '../hooks';
import { GameBoard } from '../components/game';
import type { AIDifficulty } from '../game';

interface SinglePlayerGameProps {
  playerName: string;
  aiCount: number;
  difficulty: AIDifficulty;
  onMainMenu: () => void;
}

export function SinglePlayerGame({
  playerName,
  aiCount,
  difficulty,
  onMainMenu,
}: SinglePlayerGameProps) {
  const {
    state,
    humanPlayerId,
    startGame,
    playCards,
    pickupPyre,
    flipFaceDown,
    resetGame,
  } = useSinglePlayerGame({ playerName, aiCount, difficulty });

  // Start the game on mount
  useEffect(() => {
    startGame();
  }, [startGame]);

  const handlePlayAgain = () => {
    resetGame();
    startGame();
  };

  return (
    <GameBoard
      state={state}
      localPlayerId={humanPlayerId}
      onPlayCards={playCards}
      onPickupPyre={pickupPyre}
      onFlipFaceDown={flipFaceDown}
      onPlayAgain={handlePlayAgain}
      onMainMenu={onMainMenu}
    />
  );
}
