import { useState } from 'react';
import type { OnlineGameState, Card, ClientPlayer } from '../../types';
import { CardHand, FaceDownCards } from '../card';
import { Button } from '../ui';
import { Pyre } from './Pyre';
import { TurnIndicator } from './TurnIndicator';
import { GameLog } from './GameLog';
import { isValidPlay, getCardById } from '../../utils';

interface OnlineGameBoardProps {
  gameState: OnlineGameState;
  isMyTurn: boolean;
  onPlayCards: (cardIds: string[]) => void;
  onPickupPyre: () => void;
  onFlipFaceDown: (index: number) => void;
  onMainMenu: () => void;
}

export function OnlineGameBoard({
  gameState,
  isMyTurn,
  onPlayCards,
  onPickupPyre,
  onFlipFaceDown,
  onMainMenu,
}: OnlineGameBoardProps) {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const topPyreCard = gameState.pyre.length > 0 ? gameState.pyre[gameState.pyre.length - 1] : null;
  const playingFaceDown = gameState.yourHand.length === 0 && gameState.yourFaceDownCards.length > 0;
  const winner = gameState.winner
    ? gameState.players.find((p) => p.id === gameState.winner)
    : null;

  // Convert ClientPlayer to Player format for GameLog
  const playersForLog = gameState.players.map((p) => ({
    id: p.id,
    name: p.name,
    hand: [] as Card[],
    faceDownCards: [] as Card[],
    isConnected: p.isConnected,
  }));

  const handleCardClick = (cardId: string) => {
    if (!isMyTurn) return;

    setSelectedCardIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }

      if (prev.length > 0) {
        const firstCard = getCardById(gameState.yourHand, prev[0]);
        const newCard = getCardById(gameState.yourHand, cardId);
        if (firstCard && newCard && firstCard.rank !== newCard.rank) {
          return [cardId];
        }
      }

      return [...prev, cardId];
    });
  };

  const handlePlayCards = () => {
    if (selectedCardIds.length === 0) return;

    const cards = selectedCardIds
      .map((id) => getCardById(gameState.yourHand, id))
      .filter((c): c is Card => c !== undefined);

    if (isValidPlay(cards, topPyreCard)) {
      onPlayCards(selectedCardIds);
      setSelectedCardIds([]);
    }
  };

  const canPlay = () => {
    if (selectedCardIds.length === 0) return false;
    const cards = selectedCardIds
      .map((id) => getCardById(gameState.yourHand, id))
      .filter((c): c is Card => c !== undefined);
    return isValidPlay(cards, topPyreCard);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1b5e20 0%, #0d3d0f 100%)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Turn indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <TurnIndicator
          currentPlayer={currentPlayer ? { ...currentPlayer, hand: [], faceDownCards: [], isConnected: true } : null}
          phase={gameState.phase}
        />
      </div>

      {/* Opponents area */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        {gameState.players
          .filter((p) => p.id !== gameState.yourPlayerId)
          .map((player) => (
            <OnlineOpponentArea
              key={player.id}
              player={player}
              isCurrentPlayer={currentPlayer?.id === player.id}
            />
          ))}
      </div>

      {/* Center area: Pyre and Game Log */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '40px',
          marginBottom: '24px',
          flex: 1,
        }}
      >
        <Pyre cards={gameState.pyre} />

        <div style={{ width: '250px' }}>
          <GameLog history={gameState.turnHistory} players={playersForLog} />
        </div>
      </div>

      {/* Your area */}
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: isMyTurn ? '3px solid #4caf50' : '3px solid transparent',
        }}
      >
        <div style={{ marginBottom: '16px', textAlign: 'center', color: 'white' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Your Cards</h3>
          {isMyTurn && (
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
        {gameState.yourFaceDownCards.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '8px', textAlign: 'center' }}>
              Face-down cards
            </div>
            <FaceDownCards
              cards={gameState.yourFaceDownCards}
              selectable={isMyTurn && playingFaceDown}
              onCardClick={onFlipFaceDown}
            />
          </div>
        )}

        {/* Hand */}
        {gameState.yourHand.length > 0 && (
          <CardHand
            cards={gameState.yourHand}
            selectedCardIds={selectedCardIds}
            onCardClick={handleCardClick}
            disabled={!isMyTurn}
          />
        )}

        {/* Action buttons */}
        {isMyTurn && !playingFaceDown && (
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
              disabled={gameState.pyre.length === 0}
            >
              Pick Up Pyre
            </Button>
          </div>
        )}

        {isMyTurn && playingFaceDown && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', marginTop: '16px' }}>
            Click a face-down card to flip and play it
          </div>
        )}
      </div>

      {/* Winner overlay */}
      {winner && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              padding: '48px 64px',
              borderRadius: '24px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {winner.id === gameState.yourPlayerId ? '🎉' : '😢'}
            </div>
            <h1 style={{ color: 'white', fontSize: '36px', margin: '0 0 8px 0' }}>
              {winner.id === gameState.yourPlayerId ? 'You Win!' : 'Game Over'}
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '24px', margin: '0 0 32px 0' }}>
              {winner.name} wins the game!
            </p>
            <Button variant="primary" size="large" onClick={onMainMenu}>
              Main Menu
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OnlineOpponentArea({
  player,
  isCurrentPlayer,
}: {
  player: ClientPlayer;
  isCurrentPlayer: boolean;
}) {
  return (
    <div
      style={{
        padding: '16px',
        background: isCurrentPlayer ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: isCurrentPlayer ? '2px solid #2196f3' : '2px solid transparent',
        textAlign: 'center',
        minWidth: '150px',
        opacity: player.isConnected ? 1 : 0.5,
      }}
    >
      <div style={{ color: 'white', fontWeight: 600, marginBottom: '8px' }}>
        {player.name}
        {!player.isConnected && ' (Disconnected)'}
      </div>

      {player.handCount > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
            {Array.from({ length: Math.min(player.handCount, 7) }).map((_, i) => (
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
            {player.handCount} cards
          </div>
        </div>
      )}

      {player.faceDownCount > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
            {Array.from({ length: player.faceDownCount }).map((_, i) => (
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
          style={{ marginTop: '8px', color: '#4caf50', fontSize: '12px', fontWeight: 600 }}
          className="animate-pulse"
        >
          Playing...
        </div>
      )}
    </div>
  );
}
