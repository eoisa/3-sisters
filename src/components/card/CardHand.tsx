import { useRef, useEffect, useState } from 'react';
import type { Card as CardType } from '../../types';
import { Card } from './Card';
import { sortCardsForHand } from '../../utils';

interface CardHandProps {
  cards: CardType[];
  selectedCardIds: string[];
  onCardClick: (cardId: string) => void;
  disabled?: boolean;
  sortCards?: boolean;
}

const CARD_WIDTH = 80; // matches --card-width in variables.css
const MIN_OVERLAP = 60; // maximum overlap (minimum visible per card)
const MAX_OVERLAP = 30; // minimum overlap (maximum visible per card)

export function CardHand({
  cards,
  selectedCardIds,
  onCardClick,
  disabled = false,
  sortCards = true,
}: CardHandProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlap, setOverlap] = useState(MAX_OVERLAP);
  const displayCards = sortCards ? sortCardsForHand(cards) : cards;

  useEffect(() => {
    const calculateOverlap = () => {
      if (!containerRef.current || cards.length <= 1) {
        setOverlap(MAX_OVERLAP);
        return;
      }

      const containerWidth = containerRef.current.clientWidth - 40; // account for padding
      const cardCount = cards.length;

      // Calculate the width needed with minimum overlap
      const widthWithMinOverlap = CARD_WIDTH + (cardCount - 1) * (CARD_WIDTH - MIN_OVERLAP);

      if (widthWithMinOverlap <= containerWidth) {
        // Cards fit comfortably, use standard overlap
        const availableSpace = containerWidth - CARD_WIDTH;
        const spaceBetweenCards = availableSpace / (cardCount - 1);
        const calculatedOverlap = Math.max(0, CARD_WIDTH - spaceBetweenCards);
        setOverlap(Math.min(Math.max(calculatedOverlap, MAX_OVERLAP), MIN_OVERLAP));
      } else {
        // Cards need maximum overlap, will scroll if still too wide
        setOverlap(MIN_OVERLAP);
      }
    };

    calculateOverlap();

    const resizeObserver = new ResizeObserver(calculateOverlap);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [cards.length]);

  return (
    <div
      ref={containerRef}
      className="card-hand-container"
    >
      <div
        className="card-hand"
        style={{ '--card-overlap': `-${overlap}px` } as React.CSSProperties}
      >
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
    </div>
  );
}
