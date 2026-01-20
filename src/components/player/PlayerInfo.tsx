import type { Player } from '../../types';

interface PlayerInfoProps {
  player: Player;
  isCurrentPlayer: boolean;
  isLocalPlayer?: boolean;
}

export function PlayerInfo({
  player,
  isCurrentPlayer,
  isLocalPlayer = false,
}: PlayerInfoProps) {
  return (
    <div
      style={{
        padding: '12px 16px',
        background: isCurrentPlayer ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        border: isCurrentPlayer ? '2px solid #2196f3' : '2px solid transparent',
        textAlign: 'center',
        color: 'white',
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: '16px',
          marginBottom: '4px',
        }}
      >
        {player.name}
        {isLocalPlayer && ' (You)'}
      </div>
      <div style={{ fontSize: '14px', opacity: 0.8 }}>
        {player.hand.length} in hand
        {player.faceDownCards.length > 0 && ` | ${player.faceDownCards.length} face-down`}
      </div>
      {isCurrentPlayer && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#4caf50',
          }}
          className="animate-pulse"
        >
          Current Turn
        </div>
      )}
    </div>
  );
}
