import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAIDecision, getAIThinkingTime, getAIPlayerName } from './ai';
import type { GameState, Card, Player } from '../types';

// Helper to create cards
function card(rank: Card['rank'], suit: Card['suit'] = 'hearts'): Card {
  return { id: `${suit}-${rank}`, suit, rank };
}

// Helper to create a game state for AI testing
function createGameState(overrides: Partial<GameState> = {}): GameState {
  const defaultPlayers: Player[] = [
    { id: 'player-0', name: 'Human', hand: [card('5'), card('7')], faceUpCards: [], faceDownCards: [card('A', 'spades')], isConnected: true },
    { id: 'ai-1', name: 'Bot Alice', hand: [card('6'), card('8'), card('Q')], faceUpCards: [], faceDownCards: [card('J', 'spades')], isConnected: true },
  ];

  return {
    phase: 'playing',
    players: defaultPlayers,
    currentPlayerIndex: 1, // AI's turn
    direction: 1,
    pyre: [],
    discardPile: [],
    turnHistory: [],
    winner: null,
    firstThreeDiscarderId: null,
    ...overrides,
  };
}

describe('getAIDecision', () => {
  beforeEach(() => {
    // Mock Math.random for deterministic tests
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic decision making', () => {
    it('returns pickup when player not found', () => {
      const state = createGameState();
      const decision = getAIDecision(state, 'nonexistent-player');

      expect(decision.action).toBe('pickup');
    });

    it('returns flipFaceDown when hand is empty but face-down cards remain', () => {
      const state = createGameState({
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [], faceUpCards: [], faceDownCards: [card('7'), card('K')], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1');

      expect(decision.action).toBe('flipFaceDown');
      expect(decision.faceDownIndex).toBeDefined();
      expect(decision.faceDownIndex).toBeGreaterThanOrEqual(0);
      expect(decision.faceDownIndex).toBeLessThan(2);
    });

    it('returns pickup when no playable cards', () => {
      const state = createGameState({
        pyre: [card('A')], // Ace is high
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('4'), card('5'), card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1');

      expect(decision.action).toBe('pickup');
    });

    it('returns play action with card IDs when playable cards exist', () => {
      const state = createGameState({
        pyre: [card('5')],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('7'), card('K')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1');

      expect(decision.action).toBe('play');
      expect(decision.cardIds).toBeDefined();
      expect(decision.cardIds!.length).toBeGreaterThan(0);
    });
  });

  describe('easy difficulty', () => {
    it('plays cards randomly', () => {
      const state = createGameState({
        pyre: [],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('4'), card('7'), card('K')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1', 'easy');

      expect(decision.action).toBe('play');
      expect(decision.cardIds).toBeDefined();
    });
  });

  describe('medium difficulty', () => {
    it('prefers to play lowest playable regular card', () => {
      const state = createGameState({
        pyre: [card('5')],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('6'), card('K'), card('A')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1', 'medium');

      expect(decision.action).toBe('play');
      expect(decision.cardIds).toContain('hearts-6');
    });

    it('burns pyre when it gets large (5+ cards)', () => {
      const state = createGameState({
        pyre: [card('4'), card('5'), card('6'), card('7'), card('9')],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('10'), card('K')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1', 'medium');

      expect(decision.action).toBe('play');
      expect(decision.cardIds).toContain('hearts-10');
    });

    it('saves burn cards when pyre is small', () => {
      const state = createGameState({
        pyre: [card('5')],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('7'), card('10')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1', 'medium');

      expect(decision.action).toBe('play');
      // Should play 7 instead of 10
      expect(decision.cardIds).toContain('hearts-7');
    });

    it('uses wild card when only special cards available', () => {
      const state = createGameState({
        pyre: [card('A')],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('2'), card('8')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1', 'medium');

      expect(decision.action).toBe('play');
      // Should play wild (2 or 8)
      const playedId = decision.cardIds![0];
      expect(['hearts-2', 'hearts-8']).toContain(playedId);
    });
  });

  describe('hard difficulty', () => {
    it('prefers to play multiple cards of the same rank', () => {
      const state = createGameState({
        pyre: [card('5')],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('7', 'hearts'), card('7', 'spades'), card('K')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1', 'hard');

      expect(decision.action).toBe('play');
      expect(decision.cardIds).toHaveLength(2);
      expect(decision.cardIds).toContain('hearts-7');
      expect(decision.cardIds).toContain('spades-7');
    });

    it('burns pyre at threshold of 4+ cards', () => {
      const state = createGameState({
        pyre: [card('4'), card('5'), card('6'), card('7')],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('10'), card('K')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1', 'hard');

      expect(decision.action).toBe('play');
      expect(decision.cardIds).toContain('hearts-10');
    });

    it('saves wild cards when regular cards available', () => {
      const state = createGameState({
        pyre: [card('5')],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('2'), card('7')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1', 'hard');

      expect(decision.action).toBe('play');
      expect(decision.cardIds).toContain('hearts-7');
      expect(decision.cardIds).not.toContain('hearts-2');
    });
  });

  describe('playing on empty pyre', () => {
    it('can play any card on empty pyre', () => {
      const state = createGameState({
        pyre: [],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('4')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1', 'medium');

      expect(decision.action).toBe('play');
      expect(decision.cardIds).toContain('hearts-4');
    });
  });

  describe('playing on wild cards', () => {
    it('can play any card on a 2 (wild)', () => {
      const state = createGameState({
        pyre: [card('2')],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('4')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1', 'medium');

      expect(decision.action).toBe('play');
      expect(decision.cardIds).toContain('hearts-4');
    });

    it('can play any card on an 8 (reverse wild)', () => {
      const state = createGameState({
        pyre: [card('8')],
        players: [
          { id: 'player-0', name: 'Human', hand: [card('5')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'ai-1', name: 'Bot', hand: [card('4')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const decision = getAIDecision(state, 'ai-1', 'medium');

      expect(decision.action).toBe('play');
      expect(decision.cardIds).toContain('hearts-4');
    });
  });
});

describe('getAIThinkingTime', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns time in expected range for easy difficulty', () => {
    const time = getAIThinkingTime('easy');
    // With Math.random() = 0.5: 500 + 0.5 * 500 = 750
    expect(time).toBe(750);
  });

  it('returns time in expected range for medium difficulty', () => {
    const time = getAIThinkingTime('medium');
    // With Math.random() = 0.5: 800 + 0.5 * 700 = 1150
    expect(time).toBe(1150);
  });

  it('returns time in expected range for hard difficulty', () => {
    const time = getAIThinkingTime('hard');
    // With Math.random() = 0.5: 1000 + 0.5 * 1000 = 1500
    expect(time).toBe(1500);
  });
});

describe('getAIPlayerName', () => {
  it('returns different names for different indices', () => {
    const name0 = getAIPlayerName(0);
    const name1 = getAIPlayerName(1);
    const name2 = getAIPlayerName(2);

    expect(name0).not.toBe(name1);
    expect(name1).not.toBe(name2);
  });

  it('returns names starting with "Bot"', () => {
    for (let i = 0; i < 7; i++) {
      const name = getAIPlayerName(i);
      expect(name).toMatch(/^Bot /);
    }
  });

  it('wraps around for indices beyond the names array', () => {
    const name0 = getAIPlayerName(0);
    const name7 = getAIPlayerName(7);

    expect(name0).toBe(name7);
  });
});
