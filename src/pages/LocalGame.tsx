import { useLocalGame } from '../hooks';
import { GameBoard } from '../components/game';
import { PassDeviceScreen } from '../components/lobby';

interface LocalGameProps {
  onMainMenu: () => void;
}

export function LocalGame({ onMainMenu }: LocalGameProps) {
  const {
    state,
    localPlayerId,
    showPassScreen,
    pendingPlayerId,
    playCards,
    playFaceUpCards,
    pickupPyre,
    flipFaceDown,
    resetGame,
    switchToPlayer,
  } = useLocalGame();

  const handlePlayAgain = () => {
    // Re-start with the same player names
    resetGame();
    onMainMenu();
  };

  const pendingPlayer = pendingPlayerId
    ? state.players.find((p) => p.id === pendingPlayerId)
    : null;

  if (showPassScreen && pendingPlayer) {
    return (
      <PassDeviceScreen
        nextPlayer={pendingPlayer}
        onReady={() => switchToPlayer(pendingPlayer.id)}
      />
    );
  }

  return (
    <GameBoard
      state={state}
      localPlayerId={localPlayerId}
      onPlayCards={playCards}
      onPlayFaceUpCards={playFaceUpCards}
      onPickupPyre={pickupPyre}
      onFlipFaceDown={flipFaceDown}
      onPlayAgain={handlePlayAgain}
      onMainMenu={onMainMenu}
    />
  );
}
