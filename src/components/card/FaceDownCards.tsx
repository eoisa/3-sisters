import type { Card as CardType } from '../../types';
import { Card } from './Card';

interface FaceDownCardsProps {
  cards: CardType[];
  selectable?: boolean;
  onCardClick?: (index: number) => void;
}

export function FaceDownCards({
  cards,
  selectable = false,
  onCardClick,
}: FaceDownCardsProps) {
  return (
    <div className="face-down-cards">
      {cards.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          faceDown
          disabled={!selectable}
          onClick={selectable ? () => onCardClick?.(index) : undefined}
          className={selectable ? 'card--selectable' : ''}
        />
      ))}
    </div>
  );
}
