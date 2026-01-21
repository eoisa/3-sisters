import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameBoard } from './GameBoard';
import type { GameState, Card } from '../../types';

// Helper to create cards
function card(rank: Card['rank'], suit: Card['suit'] = 'hearts'): Card {
  return { id: `${suit}-${rank}`, suit, rank };
}

// Create a minimal game state for testing
function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    phase: 'playing',
    players: [
      { id: 'player-0', name: 'Player 1', hand: [card('5'), card('7')], faceDownCards: [card('A')], isConnected: true },
      { id: 'player-1', name: 'Player 2', hand: [card('6'), card('8')], faceDownCards: [card('K')], isConnected: true },
    ],
    currentPlayerIndex: 0,
    direction: 1,
    pyre: [],
    discardPile: [],
    turnHistory: [],
    winner: null,
    firstThreeDiscarderId: null,
    ...overrides,
  };
}

describe('GameBoard', () => {
  const defaultProps = {
    state: createGameState(),
    localPlayerId: 'player-0',
    onPlayCards: vi.fn(),
    onPickupPyre: vi.fn(),
    onFlipFaceDown: vi.fn(),
    onPlayAgain: vi.fn(),
    onMainMenu: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('menu button', () => {
    it('renders a menu button', () => {
      render(<GameBoard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
    });

    it('calls onMainMenu when menu button is clicked', async () => {
      const user = userEvent.setup();
      render(<GameBoard {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /menu/i }));

      expect(defaultProps.onMainMenu).toHaveBeenCalledTimes(1);
    });

    it('menu button is visible during gameplay', () => {
      render(<GameBoard {...defaultProps} />);

      const menuButton = screen.getByRole('button', { name: /menu/i });
      expect(menuButton).toBeVisible();
    });
  });

  describe('game display', () => {
    it('displays the turn indicator', () => {
      render(<GameBoard {...defaultProps} />);

      // The turn indicator should show whose turn it is
      expect(screen.getByText("Player 1's turn")).toBeInTheDocument();
    });

    it('displays opponents', () => {
      render(<GameBoard {...defaultProps} />);

      // Player 2 should be shown as an opponent
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    it('displays the game log', () => {
      render(<GameBoard {...defaultProps} />);

      expect(screen.getByText('Game Log')).toBeInTheDocument();
    });
  });
});
