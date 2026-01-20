import type { Player } from '../../types';

interface TurnIndicatorProps {
  currentPlayer: Player | null;
  phase: string;
}

export function TurnIndicator({ currentPlayer, phase }: TurnIndicatorProps) {
  const getPhaseMessage = () => {
    switch (phase) {
      case 'setup':
        return 'Setting up game...';
      case 'dealing':
        return 'Dealing cards...';
      case 'discardingThrees':
        return 'Players are discarding 3s...';
      case 'playing':
        return currentPlayer ? `${currentPlayer.name}'s turn` : 'Playing...';
      case 'finished':
        return 'Game Over!';
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '12px 24px',
        borderRadius: '24px',
        color: 'white',
        fontWeight: 600,
        fontSize: '18px',
        textAlign: 'center',
      }}
    >
      {getPhaseMessage()}
    </div>
  );
}
