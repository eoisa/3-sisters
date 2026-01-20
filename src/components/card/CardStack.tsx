import type { Card as CardType } from '../../types';
import { Card } from './Card';

interface CardStackProps {
  cards: CardType[];
  maxVisible?: number;
  className?: string;
}

export function CardStack({ cards, maxVisible = 4, className = '' }: CardStackProps) {
  // Only show the last few cards for visual effect
  const visibleCards = cards.slice(-maxVisible);

  return (
    <div className={`card-stack ${className}`}>
      {visibleCards.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          disabled
          className={`animate-deal-${index + 1}`}
        />
      ))}
    </div>
  );
}
