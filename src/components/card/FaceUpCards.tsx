import type { Card as CardType } from '../../types';
import { Card } from './Card';
import { sortCardsByRank } from '../../utils';

interface FaceUpCardsProps {
  cards: CardType[];
  selectedCardIds: string[];
  selectable?: boolean;
  onCardClick?: (cardId: string) => void;
}

export function FaceUpCards({
  cards,
  selectedCardIds,
  selectable = false,
  onCardClick,
}: FaceUpCardsProps) {
  const sortedCards = sortCardsByRank(cards);

  return (
    <div className="face-up-cards">
      {sortedCards.map((card) => (
        <Card
          key={card.id}
          card={card}
          selected={selectedCardIds.includes(card.id)}
          onClick={selectable && onCardClick ? () => onCardClick(card.id) : undefined}
          className={selectable ? 'card--selectable' : ''}
        />
      ))}
    </div>
  );
}
