import { useState } from 'react';
import type { Player, Card } from '../../types';
import { CardHand, FaceDownCards, FaceUpCards } from '../card';
import { Button } from '../ui';
import { isPlayingFaceDown, isPlayingFaceUp } from '../../game';
import { isValidPlay, getCardById } from '../../utils';

interface PlayerAreaProps {
  player: Player;
  isCurrentPlayer: boolean;
  pyre: Card[];
  onPlayCards: (cardIds: string[]) => void;
  onPlayFaceUpCards: (cardIds: string[]) => void;
  onPickupPyre: () => void;
  onFlipFaceDown: (index: number) => void;
}

export function PlayerArea({
  player,
  isCurrentPlayer,
  pyre,
  onPlayCards,
  onPlayFaceUpCards,
  onPickupPyre,
  onFlipFaceDown,
}: PlayerAreaProps) {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [selectedFaceUpCardIds, setSelectedFaceUpCardIds] = useState<string[]>([]);
  const playingFaceDown = isPlayingFaceDown(player);
  const playingFaceUp = isPlayingFaceUp(player);

  const handleCardClick = (cardId: string) => {
    if (!isCurrentPlayer) return;

    setSelectedCardIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }

      // Check if the new card has the same rank as selected cards
      if (prev.length > 0) {
        const firstCard = getCardById(player.hand, prev[0]);
        const newCard = getCardById(player.hand, cardId);
        if (firstCard && newCard && firstCard.rank !== newCard.rank) {
          // Different rank, start new selection
          return [cardId];
        }
      }

      return [...prev, cardId];
    });
  };

  const handleFaceUpCardClick = (cardId: string) => {
    if (!isCurrentPlayer || !playingFaceUp) return;

    // Face-up cards can only be played one at a time - toggle single selection
    setSelectedFaceUpCardIds((prev) => {
      if (prev.includes(cardId)) {
        return [];
      }
      return [cardId];
    });
  };

  const handlePlayCards = () => {
    if (selectedCardIds.length === 0) return;

    const cards = selectedCardIds
      .map((id) => getCardById(player.hand, id))
      .filter((c): c is Card => c !== undefined);

    if (isValidPlay(cards, pyre)) {
      onPlayCards(selectedCardIds);
      setSelectedCardIds([]);
    }
  };

  const handlePlayFaceUpCards = () => {
    if (selectedFaceUpCardIds.length === 0) return;

    const cards = selectedFaceUpCardIds
      .map((id) => getCardById(player.faceUpCards, id))
      .filter((c): c is Card => c !== undefined);

    if (isValidPlay(cards, pyre)) {
      onPlayFaceUpCards(selectedFaceUpCardIds);
      setSelectedFaceUpCardIds([]);
    }
  };

  const canPlay = () => {
    if (selectedCardIds.length === 0) return false;
    const cards = selectedCardIds
      .map((id) => getCardById(player.hand, id))
      .filter((c): c is Card => c !== undefined);
    return isValidPlay(cards, pyre);
  };

  const canPlayFaceUp = () => {
    if (selectedFaceUpCardIds.length === 0) return false;
    const cards = selectedFaceUpCardIds
      .map((id) => getCardById(player.faceUpCards, id))
      .filter((c): c is Card => c !== undefined);
    return isValidPlay(cards, pyre);
  };

  return (
    <div
      style={{
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: isCurrentPlayer ? '3px solid #4caf50' : '3px solid transparent',
      }}
    >
      <div style={{ marginBottom: '16px', textAlign: 'center', color: 'white' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>{player.name}</h3>
        {isCurrentPlayer && (
          <span
            style={{
              background: '#4caf50',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Your Turn
          </span>
        )}
      </div>

      {/* Face-down cards */}
      {player.faceDownCards.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '8px', textAlign: 'center' }}>
            Face-down cards
          </div>
          <FaceDownCards
            cards={player.faceDownCards}
            selectable={isCurrentPlayer && playingFaceDown}
            onCardClick={onFlipFaceDown}
          />
        </div>
      )}

      {/* Face-up cards (table cards) */}
      {player.faceUpCards.length > 0 && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px',
            background: 'rgba(255, 193, 7, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 193, 7, 0.3)',
          }}
        >
          <div
            style={{
              color: 'rgba(255, 193, 7, 0.9)',
              fontSize: '12px',
              marginBottom: '8px',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            Table Cards
          </div>
          <FaceUpCards
            cards={player.faceUpCards}
            selectedCardIds={selectedFaceUpCardIds}
            selectable={isCurrentPlayer && playingFaceUp}
            onCardClick={handleFaceUpCardClick}
          />
        </div>
      )}

      {/* Hand */}
      {player.hand.length > 0 && (
        <CardHand
          cards={player.hand}
          selectedCardIds={selectedCardIds}
          onCardClick={handleCardClick}
          disabled={!isCurrentPlayer}
        />
      )}

      {/* Action buttons for hand play */}
      {isCurrentPlayer && player.hand.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <Button
            variant="success"
            onClick={handlePlayCards}
            disabled={!canPlay()}
          >
            Play Cards
          </Button>
          <Button
            variant="danger"
            onClick={onPickupPyre}
            disabled={pyre.length === 0}
          >
            Pick Up Pyre
          </Button>
        </div>
      )}

      {/* Action buttons for face-up card play */}
      {isCurrentPlayer && playingFaceUp && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <Button
            variant="success"
            onClick={handlePlayFaceUpCards}
            disabled={!canPlayFaceUp()}
          >
            Play Table Cards
          </Button>
          <Button
            variant="danger"
            onClick={onPickupPyre}
            disabled={pyre.length === 0}
          >
            Pick Up Pyre
          </Button>
        </div>
      )}

      {isCurrentPlayer && playingFaceDown && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', marginTop: '16px' }}>
          Click a face-down card to flip and play it
        </div>
      )}
    </div>
  );
}
