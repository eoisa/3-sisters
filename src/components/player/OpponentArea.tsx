import type { Player } from '../../types';

interface OpponentAreaProps {
  player: Player;
  isCurrentPlayer: boolean;
}

export function OpponentArea({ player, isCurrentPlayer }: OpponentAreaProps) {
  return (
    <div
      style={{
        padding: '16px',
        background: isCurrentPlayer ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: isCurrentPlayer ? '2px solid #2196f3' : '2px solid transparent',
        textAlign: 'center',
        minWidth: '150px',
      }}
    >
      <div
        style={{
          color: 'white',
          fontWeight: 600,
          marginBottom: '8px',
        }}
      >
        {player.name}
      </div>

      {/* Card backs representing hand */}
      {player.hand.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2px',
            }}
          >
            {Array.from({ length: Math.min(player.hand.length, 7) }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '20px',
                  height: '28px',
                  background: '#1565c0',
                  borderRadius: '3px',
                  border: '1px solid white',
                }}
              />
            ))}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px' }}>
            {player.hand.length} cards
          </div>
        </div>
      )}

      {/* Face-down cards indicator */}
      {player.faceDownCards.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            {Array.from({ length: player.faceDownCards.length }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '24px',
                  height: '34px',
                  background: '#0d47a1',
                  borderRadius: '4px',
                  border: '2px solid white',
                }}
              />
            ))}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '4px' }}>
            face-down
          </div>
        </div>
      )}

      {isCurrentPlayer && (
        <div
          style={{
            marginTop: '8px',
            color: '#4caf50',
            fontSize: '12px',
            fontWeight: 600,
          }}
          className="animate-pulse"
        >
          Playing...
        </div>
      )}
    </div>
  );
}
