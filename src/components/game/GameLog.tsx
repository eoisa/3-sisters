import type { TurnAction, Player } from '../../types';
import { SUIT_SYMBOLS } from '../../constants';

interface GameLogProps {
  history: TurnAction[];
  players: Player[];
  maxEntries?: number;
}

export function GameLog({ history, players, maxEntries = 10 }: GameLogProps) {
  const getPlayerName = (playerId: string) => {
    return players.find((p) => p.id === playerId)?.name ?? 'Unknown';
  };

  const formatAction = (action: TurnAction) => {
    const playerName = getPlayerName(action.playerId);
    const cardStr = action.cards
      .map((c) => `${c.rank}${SUIT_SYMBOLS[c.suit]}`)
      .join(', ');

    switch (action.type) {
      case 'play':
        return `${playerName} played ${cardStr}`;
      case 'pickup':
        return `${playerName} picked up the pyre`;
      case 'discardThree':
        return `${playerName} discarded ${cardStr}`;
      case 'burn':
        return `${playerName} burned the pyre with ${cardStr}`;
      case 'flipFaceDown':
        return `${playerName} flipped ${cardStr}`;
      default:
        return `${playerName} did something`;
    }
  };

  const recentHistory = history.slice(-maxEntries).reverse();

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '8px',
        padding: '12px',
        maxHeight: '200px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '8px',
        }}
      >
        Game Log
      </div>
      {recentHistory.length === 0 ? (
        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>
          No actions yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {recentHistory.map((action, index) => (
            <div
              key={action.timestamp}
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '13px',
                opacity: 1 - index * 0.08,
              }}
            >
              {formatAction(action)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
