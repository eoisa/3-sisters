import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameLog } from './GameLog';
import type { TurnAction, Player, Card } from '../../types';

// Helper to create cards
function card(rank: Card['rank'], suit: Card['suit'] = 'hearts'): Card {
  return { id: `${suit}-${rank}`, suit, rank };
}

// Test players
const players: Player[] = [
  { id: 'player-1', name: 'Alice', hand: [], faceUpCards: [], faceDownCards: [], isConnected: true },
  { id: 'player-2', name: 'Bob', hand: [], faceUpCards: [], faceDownCards: [], isConnected: true },
];

describe('GameLog', () => {
  describe('formatAction', () => {
    it('displays "played" for play actions', () => {
      const history: TurnAction[] = [
        { playerId: 'player-1', type: 'play', cards: [card('7')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Alice played 7♥')).toBeInTheDocument();
    });

    it('displays "picked up the pyre" for pickup actions', () => {
      const history: TurnAction[] = [
        { playerId: 'player-2', type: 'pickup', cards: [card('5'), card('K')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Bob picked up the pyre')).toBeInTheDocument();
    });

    it('displays "discarded" for discardThree actions', () => {
      const history: TurnAction[] = [
        { playerId: 'player-1', type: 'discardThree', cards: [card('3'), card('3', 'spades')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Alice discarded 3♥, 3♠')).toBeInTheDocument();
    });

    it('displays "burned the pyre" for burn actions', () => {
      const history: TurnAction[] = [
        { playerId: 'player-1', type: 'burn', cards: [card('10')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Alice burned the pyre with 10♥')).toBeInTheDocument();
    });

    it('displays "flipped" for flipFaceDown actions', () => {
      const history: TurnAction[] = [
        { playerId: 'player-2', type: 'flipFaceDown', cards: [card('A')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Bob flipped A♥')).toBeInTheDocument();
    });

    it('displays "reversed the flow" for reverse actions', () => {
      const history: TurnAction[] = [
        { playerId: 'player-1', type: 'reverse', cards: [card('8')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Alice reversed the flow with 8♥')).toBeInTheDocument();
    });

    it('displays multiple 8s correctly when reversed', () => {
      const history: TurnAction[] = [
        { playerId: 'player-2', type: 'reverse', cards: [card('8', 'hearts'), card('8', 'spades')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Bob reversed the flow with 8♥, 8♠')).toBeInTheDocument();
    });
  });

  describe('display', () => {
    it('shows "No actions yet" when history is empty', () => {
      render(<GameLog history={[]} players={players} />);

      expect(screen.getByText('No actions yet')).toBeInTheDocument();
    });

    it('shows most recent actions first', () => {
      const history: TurnAction[] = [
        { playerId: 'player-1', type: 'play', cards: [card('5')], timestamp: 1 },
        { playerId: 'player-2', type: 'play', cards: [card('7')], timestamp: 2 },
        { playerId: 'player-1', type: 'play', cards: [card('K')], timestamp: 3 },
      ];

      render(<GameLog history={history} players={players} />);

      const logEntries = screen.getAllByText(/played/);
      expect(logEntries[0]).toHaveTextContent('Alice played K♥');
      expect(logEntries[1]).toHaveTextContent('Bob played 7♥');
      expect(logEntries[2]).toHaveTextContent('Alice played 5♥');
    });

    it('limits entries to maxEntries prop', () => {
      const history: TurnAction[] = [
        { playerId: 'player-1', type: 'play', cards: [card('4')], timestamp: 1 },
        { playerId: 'player-2', type: 'play', cards: [card('5')], timestamp: 2 },
        { playerId: 'player-1', type: 'play', cards: [card('6')], timestamp: 3 },
        { playerId: 'player-2', type: 'play', cards: [card('7')], timestamp: 4 },
        { playerId: 'player-1', type: 'play', cards: [card('8')], timestamp: 5 },
      ];

      render(<GameLog history={history} players={players} maxEntries={3} />);

      const logEntries = screen.getAllByText(/played|reversed/);
      expect(logEntries).toHaveLength(3);
      // Should show the 3 most recent
      expect(screen.queryByText('Alice played 4♥')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob played 5♥')).not.toBeInTheDocument();
    });

    it('shows "Unknown" for unknown player IDs', () => {
      const history: TurnAction[] = [
        { playerId: 'unknown-player', type: 'play', cards: [card('A')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Unknown played A♥')).toBeInTheDocument();
    });
  });

  describe('card formatting', () => {
    it('displays hearts symbol correctly', () => {
      const history: TurnAction[] = [
        { playerId: 'player-1', type: 'play', cards: [card('K', 'hearts')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Alice played K♥')).toBeInTheDocument();
    });

    it('displays diamonds symbol correctly', () => {
      const history: TurnAction[] = [
        { playerId: 'player-1', type: 'play', cards: [card('Q', 'diamonds')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Alice played Q♦')).toBeInTheDocument();
    });

    it('displays clubs symbol correctly', () => {
      const history: TurnAction[] = [
        { playerId: 'player-1', type: 'play', cards: [card('J', 'clubs')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Alice played J♣')).toBeInTheDocument();
    });

    it('displays spades symbol correctly', () => {
      const history: TurnAction[] = [
        { playerId: 'player-1', type: 'play', cards: [card('A', 'spades')], timestamp: 1 },
      ];

      render(<GameLog history={history} players={players} />);

      expect(screen.getByText('Alice played A♠')).toBeInTheDocument();
    });
  });
});
