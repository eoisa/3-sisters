import type { Card as CardType } from '../../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../constants';
import '../../styles/cards.css';

interface CardProps {
  card: CardType;
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({
  card,
  faceDown = false,
  selected = false,
  disabled = false,
  onClick,
  className = '',
}: CardProps) {
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitColor = SUIT_COLORS[card.suit];
  const colorClass = suitColor === '#e53935' ? 'card--red' : 'card--black';

  const cardClasses = [
    'card',
    colorClass,
    faceDown ? 'card--flipped' : '',
    selected ? 'card--selected' : '',
    disabled ? 'card--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} onClick={disabled ? undefined : onClick}>
      <div className="card__inner">
        <div className="card__face card__front">
          <div className="card__corner card__corner--top">
            <span className="card__rank">{card.rank}</span>
            <span className="card__suit">{suitSymbol}</span>
          </div>
          <div className="card__center">{suitSymbol}</div>
          <div className="card__corner card__corner--bottom">
            <span className="card__rank">{card.rank}</span>
            <span className="card__suit">{suitSymbol}</span>
          </div>
        </div>
        <div className="card__face card__back" />
      </div>
    </div>
  );
}
