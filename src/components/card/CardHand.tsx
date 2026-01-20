import type { Card as CardType } from '../../types';
import { Card } from './Card';
import { sortCardsByRank } from '../../utils';

interface CardHandProps {
  cards: CardType[];
  selectedCardIds: string[];
  onCardClick: (cardId: string) => void;
  disabled?: boolean;
  sortCards?: boolean;
}

export function CardHand({
  cards,
  selectedCardIds,
  onCardClick,
  disabled = false,
  sortCards = true,
}: CardHandProps) {
  const displayCards = sortCards ? sortCardsByRank(cards) : cards;

  return (
    <div className="card-hand">
      {displayCards.map((card) => (
        <Card
          key={card.id}
          card={card}
          selected={selectedCardIds.includes(card.id)}
          disabled={disabled}
          onClick={() => onCardClick(card.id)}
        />
      ))}
    </div>
  );
}
