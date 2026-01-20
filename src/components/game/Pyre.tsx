import type { Card } from '../../types';
import { CardStack } from '../card';

interface PyreProps {
  cards: Card[];
  burning?: boolean;
}

export function Pyre({ cards, burning = false }: PyreProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        Pyre
      </div>

      <div
        style={{
          width: '120px',
          height: '160px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed rgba(255, 255, 255, 0.3)',
        }}
        className={burning ? 'animate-burn' : ''}
      >
        {cards.length > 0 ? (
          <CardStack cards={cards} />
        ) : (
          <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '14px' }}>
            Empty
          </span>
        )}
      </div>

      <div
        style={{
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '12px',
        }}
      >
        {cards.length} card{cards.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
