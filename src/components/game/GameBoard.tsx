import type { GameState } from '../../types';
import { getCurrentPlayer, getTopPyreCard, getWinner } from '../../game';
import { PlayerArea, OpponentArea } from '../player';
import { Button } from '../ui';
import { Pyre } from './Pyre';
import { TurnIndicator } from './TurnIndicator';
import { GameLog } from './GameLog';
import { WinnerOverlay } from './WinnerOverlay';

interface GameBoardProps {
  state: GameState;
  localPlayerId: string;
  onPlayCards: (cardIds: string[]) => void;
  onPlayFaceUpCards: (cardIds: string[]) => void;
  onPickupPyre: () => void;
  onFlipFaceDown: (index: number) => void;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function GameBoard({
  state,
  localPlayerId,
  onPlayCards,
  onPlayFaceUpCards,
  onPickupPyre,
  onFlipFaceDown,
  onPlayAgain,
  onMainMenu,
}: GameBoardProps) {
  const currentPlayer = getCurrentPlayer(state);
  const topPyreCard = getTopPyreCard(state);
  const winner = getWinner(state);
  const localPlayer = state.players.find((p) => p.id === localPlayerId);
  const opponents = state.players.filter((p) => p.id !== localPlayerId);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1b5e20 0%, #0d3d0f 100%)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Menu button */}
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <Button variant="secondary" size="small" onClick={onMainMenu}>
          ← Menu
        </Button>
      </div>

      {/* Turn indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <TurnIndicator currentPlayer={currentPlayer} phase={state.phase} />
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
        {opponents.map((player) => (
          <OpponentArea
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
        <Pyre cards={state.pyre} />

        <div style={{ width: '250px' }}>
          <GameLog history={state.turnHistory} players={state.players} />
        </div>
      </div>

      {/* Local player area */}
      {localPlayer && (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <PlayerArea
            player={localPlayer}
            isCurrentPlayer={currentPlayer?.id === localPlayerId}
            topPyreCard={topPyreCard}
            onPlayCards={onPlayCards}
            onPlayFaceUpCards={onPlayFaceUpCards}
            onPickupPyre={onPickupPyre}
            onFlipFaceDown={onFlipFaceDown}
            pyreEmpty={state.pyre.length === 0}
          />
        </div>
      )}

      {/* Winner overlay */}
      {winner && (
        <WinnerOverlay
          winner={winner}
          onPlayAgain={onPlayAgain}
          onMainMenu={onMainMenu}
        />
      )}
    </div>
  );
}
