import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer, initialGameState } from './reducer';
import type { GameState, Card, Player } from '../types';

// Helper to create cards
function card(rank: Card['rank'], suit: Card['suit'] = 'hearts'): Card {
  return { id: `${suit}-${rank}`, suit, rank };
}

// Helper to create a basic playing game state
function createPlayingState(overrides: Partial<GameState> = {}): GameState {
  const defaultPlayers: Player[] = [
    { id: 'player-0', name: 'Player 1', hand: [card('5'), card('7'), card('K')], faceUpCards: [], faceDownCards: [card('A', 'spades')], isConnected: true },
    { id: 'player-1', name: 'Player 2', hand: [card('6'), card('8'), card('Q')], faceUpCards: [], faceDownCards: [card('J', 'spades')], isConnected: true },
    { id: 'player-2', name: 'Player 3', hand: [card('4'), card('9'), card('A')], faceUpCards: [], faceDownCards: [card('K', 'spades')], isConnected: true },
  ];

  return {
    phase: 'playing',
    players: defaultPlayers,
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

describe('gameReducer', () => {
  describe('initialGameState', () => {
    it('has correct initial values', () => {
      expect(initialGameState.phase).toBe('setup');
      expect(initialGameState.players).toEqual([]);
      expect(initialGameState.currentPlayerIndex).toBe(0);
      expect(initialGameState.direction).toBe(1);
      expect(initialGameState.pyre).toEqual([]);
      expect(initialGameState.discardPile).toEqual([]);
      expect(initialGameState.turnHistory).toEqual([]);
      expect(initialGameState.winner).toBeNull();
      expect(initialGameState.firstThreeDiscarderId).toBeNull();
    });
  });

  describe('START_GAME', () => {
    it('creates players with correct names', () => {
      const state = gameReducer(initialGameState, {
        type: 'START_GAME',
        playerNames: ['Alice', 'Bob', 'Charlie'],
      });

      expect(state.players).toHaveLength(3);
      expect(state.players[0].name).toBe('Alice');
      expect(state.players[1].name).toBe('Bob');
      expect(state.players[2].name).toBe('Charlie');
    });

    it('assigns unique player IDs', () => {
      const state = gameReducer(initialGameState, {
        type: 'START_GAME',
        playerNames: ['Alice', 'Bob', 'Charlie'],
      });

      const ids = state.players.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('deals 3 face-down cards to each player', () => {
      const state = gameReducer(initialGameState, {
        type: 'START_GAME',
        playerNames: ['Alice', 'Bob', 'Charlie'],
      });

      for (const player of state.players) {
        expect(player.faceDownCards).toHaveLength(3);
      }
    });

    it('deals 3 face-up cards to each player', () => {
      const state = gameReducer(initialGameState, {
        type: 'START_GAME',
        playerNames: ['Alice', 'Bob', 'Charlie'],
      });

      for (const player of state.players) {
        expect(player.faceUpCards).toHaveLength(3);
      }
    });

    it('deals remaining cards to hands', () => {
      const state = gameReducer(initialGameState, {
        type: 'START_GAME',
        playerNames: ['Alice', 'Bob', 'Charlie'],
      });

      // 52 cards - (3 players * 3 face-down) - (3 players * 3 face-up) = 34 cards for hands
      const totalHandCards = state.players.reduce((sum, p) => sum + p.hand.length, 0);
      expect(totalHandCards).toBe(34);
    });

    it('distributes hand cards roughly equally', () => {
      const state = gameReducer(initialGameState, {
        type: 'START_GAME',
        playerNames: ['Alice', 'Bob', 'Charlie'],
      });

      // With 34 cards and 3 players: roughly 11-12 each
      const handSizes = state.players.map((p) => p.hand.length).sort((a, b) => a - b);
      expect(handSizes[0]).toBeGreaterThanOrEqual(11);
      expect(handSizes[2]).toBeLessThanOrEqual(12);
    });

    it('sets phase to discardingThrees', () => {
      const state = gameReducer(initialGameState, {
        type: 'START_GAME',
        playerNames: ['Alice', 'Bob', 'Charlie'],
      });

      expect(state.phase).toBe('discardingThrees');
    });

    it('initializes direction to 1 (clockwise)', () => {
      const state = gameReducer(initialGameState, {
        type: 'START_GAME',
        playerNames: ['Alice', 'Bob', 'Charlie'],
      });

      expect(state.direction).toBe(1);
    });

    it('starts with empty pyre and discard pile', () => {
      const state = gameReducer(initialGameState, {
        type: 'START_GAME',
        playerNames: ['Alice', 'Bob', 'Charlie'],
      });

      expect(state.pyre).toEqual([]);
      expect(state.discardPile).toEqual([]);
    });
  });

  describe('DISCARD_THREES', () => {
    let stateWithThrees: GameState;

    beforeEach(() => {
      stateWithThrees = {
        phase: 'discardingThrees',
        players: [
          { id: 'player-0', name: 'Alice', hand: [card('3', 'hearts'), card('3', 'spades'), card('7')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'Bob', hand: [card('5'), card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
        currentPlayerIndex: 0,
        direction: 1,
        pyre: [],
        discardPile: [],
        turnHistory: [],
        winner: null,
        firstThreeDiscarderId: null,
      };
    });

    it('removes 3s from player hand', () => {
      const state = gameReducer(stateWithThrees, {
        type: 'DISCARD_THREES',
        playerId: 'player-0',
      });

      const player = state.players.find((p) => p.id === 'player-0');
      expect(player?.hand.filter((c) => c.rank === '3')).toHaveLength(0);
    });

    it('keeps non-3 cards in hand', () => {
      const state = gameReducer(stateWithThrees, {
        type: 'DISCARD_THREES',
        playerId: 'player-0',
      });

      const player = state.players.find((p) => p.id === 'player-0');
      expect(player?.hand.find((c) => c.rank === '7')).toBeDefined();
    });

    it('adds 3s to discard pile', () => {
      const state = gameReducer(stateWithThrees, {
        type: 'DISCARD_THREES',
        playerId: 'player-0',
      });

      expect(state.discardPile.filter((c) => c.rank === '3')).toHaveLength(2);
    });

    it('records first three discarder', () => {
      const state = gameReducer(stateWithThrees, {
        type: 'DISCARD_THREES',
        playerId: 'player-0',
      });

      expect(state.firstThreeDiscarderId).toBe('player-0');
    });

    it('does not change first three discarder if already set', () => {
      const stateWithFirstDiscarder = {
        ...stateWithThrees,
        firstThreeDiscarderId: 'player-1',
      };

      const state = gameReducer(stateWithFirstDiscarder, {
        type: 'DISCARD_THREES',
        playerId: 'player-0',
      });

      expect(state.firstThreeDiscarderId).toBe('player-1');
    });

    it('adds turn action to history', () => {
      const state = gameReducer(stateWithThrees, {
        type: 'DISCARD_THREES',
        playerId: 'player-0',
      });

      expect(state.turnHistory).toHaveLength(1);
      expect(state.turnHistory[0].type).toBe('discardThree');
      expect(state.turnHistory[0].playerId).toBe('player-0');
      expect(state.turnHistory[0].cards).toHaveLength(2);
    });

    it('does nothing if player has no 3s', () => {
      const state = gameReducer(stateWithThrees, {
        type: 'DISCARD_THREES',
        playerId: 'player-1',
      });

      expect(state.turnHistory).toHaveLength(0);
      expect(state.discardPile).toHaveLength(0);
    });
  });

  describe('FINISH_DISCARDING_THREES', () => {
    it('sets phase to playing', () => {
      const state = gameReducer(
        { ...initialGameState, phase: 'discardingThrees', players: [{ id: 'p1', name: 'A', hand: [], faceUpCards: [], faceDownCards: [], isConnected: true }] },
        { type: 'FINISH_DISCARDING_THREES' }
      );

      expect(state.phase).toBe('playing');
    });

    it('sets starting player to left of first three discarder', () => {
      const discardingState: GameState = {
        ...initialGameState,
        phase: 'discardingThrees',
        players: [
          { id: 'player-0', name: 'A', hand: [], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'B', hand: [], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-2', name: 'C', hand: [], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
        firstThreeDiscarderId: 'player-1',
      };

      const state = gameReducer(discardingState, { type: 'FINISH_DISCARDING_THREES' });

      // Player to the left of player-1 (index 1) is player-2 (index 2)
      expect(state.currentPlayerIndex).toBe(2);
    });

    it('wraps around to player 0 when first discarder is last player', () => {
      const discardingState: GameState = {
        ...initialGameState,
        phase: 'discardingThrees',
        players: [
          { id: 'player-0', name: 'A', hand: [], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'B', hand: [], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-2', name: 'C', hand: [], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
        firstThreeDiscarderId: 'player-2',
      };

      const state = gameReducer(discardingState, { type: 'FINISH_DISCARDING_THREES' });

      expect(state.currentPlayerIndex).toBe(0);
    });
  });

  describe('PLAY_CARDS', () => {
    it('removes played cards from hand', () => {
      const state = createPlayingState();
      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-5'],
      });

      const player = newState.players.find((p) => p.id === 'player-0');
      expect(player?.hand.find((c) => c.id === 'hearts-5')).toBeUndefined();
    });

    it('adds played cards to pyre', () => {
      const state = createPlayingState();
      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-5'],
      });

      expect(newState.pyre).toHaveLength(1);
      expect(newState.pyre[0].id).toBe('hearts-5');
    });

    it('advances to next player', () => {
      const state = createPlayingState();
      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-5'],
      });

      expect(newState.currentPlayerIndex).toBe(1);
    });

    it('wraps around to first player', () => {
      const state = createPlayingState({ currentPlayerIndex: 2 });
      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-2',
        cardIds: ['hearts-9'],
      });

      expect(newState.currentPlayerIndex).toBe(0);
    });

    it('does nothing if not current player', () => {
      const state = createPlayingState();
      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-1', // Not current player
        cardIds: ['hearts-6'],
      });

      expect(newState).toBe(state);
    });

    it('does nothing if card not in hand', () => {
      const state = createPlayingState();
      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-nonexistent'],
      });

      expect(newState).toBe(state);
    });

    it('does nothing if play is invalid (card too low)', () => {
      const state = createPlayingState({
        pyre: [card('K', 'diamonds')],
      });
      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-5'], // 5 < K, invalid
      });

      expect(newState).toBe(state);
    });

    it('allows multiple cards of the same rank', () => {
      const stateWithPairs = createPlayingState({
        players: [
          { id: 'player-0', name: 'P1', hand: [card('7', 'hearts'), card('7', 'spades'), card('K')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(stateWithPairs, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-7', 'spades-7'],
      });

      expect(newState.pyre).toHaveLength(2);
      const player = newState.players.find((p) => p.id === 'player-0');
      expect(player?.hand.filter((c) => c.rank === '7')).toHaveLength(0);
    });

    it('records turn action in history', () => {
      const state = createPlayingState();
      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-5'],
      });

      expect(newState.turnHistory).toHaveLength(1);
      expect(newState.turnHistory[0].type).toBe('play');
      expect(newState.turnHistory[0].playerId).toBe('player-0');
    });
  });

  describe('PLAY_CARDS - burn (10)', () => {
    it('clears the pyre when playing a 10', () => {
      const state = createPlayingState({
        pyre: [card('5'), card('7'), card('K')],
        players: [
          { id: 'player-0', name: 'P1', hand: [card('10')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-10'],
      });

      expect(newState.pyre).toHaveLength(0);
    });

    it('moves pyre cards to discard pile', () => {
      const state = createPlayingState({
        pyre: [card('5'), card('7')],
        players: [
          { id: 'player-0', name: 'P1', hand: [card('10')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-10'],
      });

      // Discard pile should contain the pyre cards plus the 10
      expect(newState.discardPile).toHaveLength(3);
    });

    it('records burn action type', () => {
      const state = createPlayingState({
        players: [
          { id: 'player-0', name: 'P1', hand: [card('10')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-10'],
      });

      expect(newState.turnHistory[0].type).toBe('burn');
    });

    it('advances to next player after burn (burn ends turn)', () => {
      const state = createPlayingState({
        currentPlayerIndex: 0,
        players: [
          { id: 'player-0', name: 'P1', hand: [card('10'), card('A')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-2', name: 'P3', hand: [card('7')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-10'],
      });

      expect(newState.currentPlayerIndex).toBe(1);
    });
  });

  describe('PLAY_CARDS - reverse (8)', () => {
    it('reverses direction when playing an 8', () => {
      const state = createPlayingState({
        direction: 1,
        players: [
          { id: 'player-0', name: 'P1', hand: [card('8')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-2', name: 'P3', hand: [card('7')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-8'],
      });

      expect(newState.direction).toBe(-1);
    });

    it('reverses direction from -1 to 1', () => {
      const state = createPlayingState({
        direction: -1,
        currentPlayerIndex: 1,
        players: [
          { id: 'player-0', name: 'P1', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('8')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-2', name: 'P3', hand: [card('7')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-1',
        cardIds: ['hearts-8'],
      });

      expect(newState.direction).toBe(1);
    });

    it('advances using new direction after reverse', () => {
      const state = createPlayingState({
        direction: 1,
        currentPlayerIndex: 1,
        players: [
          { id: 'player-0', name: 'P1', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('8'), card('K')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-2', name: 'P3', hand: [card('7')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-1',
        cardIds: ['hearts-8'],
      });

      // Direction reversed to -1, so from index 1, next player is index 0
      expect(newState.currentPlayerIndex).toBe(0);
    });

    it('records reverse action type', () => {
      const state = createPlayingState({
        players: [
          { id: 'player-0', name: 'P1', hand: [card('8')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-8'],
      });

      expect(newState.turnHistory[0].type).toBe('reverse');
    });

    it('allows 8 to be played on any card (wild)', () => {
      const state = createPlayingState({
        pyre: [card('A')], // Ace is high
        players: [
          { id: 'player-0', name: 'P1', hand: [card('8')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-8'],
      });

      // Should succeed - 8 is wild
      expect(newState.pyre).toHaveLength(2);
      expect(newState.direction).toBe(-1);
    });
  });

  describe('PLAY_CARDS - winning', () => {
    it('declares winner when player empties hand and has no face-up or face-down cards', () => {
      const state = createPlayingState({
        players: [
          { id: 'player-0', name: 'P1', hand: [card('7')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-7'],
      });

      expect(newState.phase).toBe('finished');
      expect(newState.winner).toBe('player-0');
    });

    it('does not win if player still has face-up cards', () => {
      const state = createPlayingState({
        players: [
          { id: 'player-0', name: 'P1', hand: [card('7')], faceUpCards: [card('K')], faceDownCards: [], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-7'],
      });

      expect(newState.phase).toBe('playing');
      expect(newState.winner).toBeNull();
    });

    it('does not win if player still has face-down cards', () => {
      const state = createPlayingState({
        players: [
          { id: 'player-0', name: 'P1', hand: [card('7')], faceUpCards: [], faceDownCards: [card('A')], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'PLAY_CARDS',
        playerId: 'player-0',
        cardIds: ['hearts-7'],
      });

      expect(newState.phase).toBe('playing');
      expect(newState.winner).toBeNull();
    });
  });

  describe('PICKUP_PYRE', () => {
    it('adds pyre cards to player hand', () => {
      const state = createPlayingState({
        pyre: [card('5'), card('7'), card('K')],
      });

      const newState = gameReducer(state, {
        type: 'PICKUP_PYRE',
        playerId: 'player-0',
      });

      const player = newState.players.find((p) => p.id === 'player-0');
      expect(player?.hand).toHaveLength(6); // 3 original + 3 from pyre
    });

    it('clears the pyre', () => {
      const state = createPlayingState({
        pyre: [card('5'), card('7')],
      });

      const newState = gameReducer(state, {
        type: 'PICKUP_PYRE',
        playerId: 'player-0',
      });

      expect(newState.pyre).toHaveLength(0);
    });

    it('advances to next player', () => {
      const state = createPlayingState({
        pyre: [card('5')],
      });

      const newState = gameReducer(state, {
        type: 'PICKUP_PYRE',
        playerId: 'player-0',
      });

      expect(newState.currentPlayerIndex).toBe(1);
    });

    it('does nothing if pyre is empty', () => {
      const state = createPlayingState({
        pyre: [],
      });

      const newState = gameReducer(state, {
        type: 'PICKUP_PYRE',
        playerId: 'player-0',
      });

      expect(newState).toBe(state);
    });

    it('does nothing if not current player', () => {
      const state = createPlayingState({
        pyre: [card('5')],
      });

      const newState = gameReducer(state, {
        type: 'PICKUP_PYRE',
        playerId: 'player-1',
      });

      expect(newState).toBe(state);
    });

    it('records pickup action in history', () => {
      const state = createPlayingState({
        pyre: [card('5')],
      });

      const newState = gameReducer(state, {
        type: 'PICKUP_PYRE',
        playerId: 'player-0',
      });

      expect(newState.turnHistory[0].type).toBe('pickup');
    });

    it('respects direction when advancing', () => {
      const state = createPlayingState({
        pyre: [card('5')],
        direction: -1,
        currentPlayerIndex: 1,
      });

      const newState = gameReducer(state, {
        type: 'PICKUP_PYRE',
        playerId: 'player-1',
      });

      // Direction is -1, so from index 1, next player is index 0
      expect(newState.currentPlayerIndex).toBe(0);
    });
  });

  describe('FLIP_FACE_DOWN', () => {
    it('only works when hand is empty', () => {
      const state = createPlayingState(); // Players have cards in hand

      const newState = gameReducer(state, {
        type: 'FLIP_FACE_DOWN',
        playerId: 'player-0',
        cardIndex: 0,
      });

      expect(newState).toBe(state);
    });

    it('flips face-down card and plays it if valid', () => {
      const state = createPlayingState({
        pyre: [card('5')],
        players: [
          { id: 'player-0', name: 'P1', hand: [], faceUpCards: [], faceDownCards: [card('7'), card('K')], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'FLIP_FACE_DOWN',
        playerId: 'player-0',
        cardIndex: 0, // 7, which can play on 5
      });

      expect(newState.pyre).toHaveLength(2);
      const player = newState.players.find((p) => p.id === 'player-0');
      expect(player?.faceDownCards).toHaveLength(1);
      expect(player?.hand).toHaveLength(0);
    });

    it('picks up pyre if flipped card cannot be played', () => {
      const state = createPlayingState({
        pyre: [card('K')],
        players: [
          { id: 'player-0', name: 'P1', hand: [], faceUpCards: [], faceDownCards: [card('5'), card('7')], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'FLIP_FACE_DOWN',
        playerId: 'player-0',
        cardIndex: 0, // 5, which cannot play on K
      });

      const player = newState.players.find((p) => p.id === 'player-0');
      // Player should have picked up the pyre (K) plus the flipped card (5)
      expect(player?.hand).toHaveLength(2);
      expect(newState.pyre).toHaveLength(0);
    });

    it('advances to next player after successful flip', () => {
      const state = createPlayingState({
        pyre: [],
        players: [
          { id: 'player-0', name: 'P1', hand: [], faceUpCards: [], faceDownCards: [card('7'), card('K')], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'FLIP_FACE_DOWN',
        playerId: 'player-0',
        cardIndex: 0,
      });

      expect(newState.currentPlayerIndex).toBe(1);
    });

    it('does nothing for invalid card index', () => {
      const state = createPlayingState({
        players: [
          { id: 'player-0', name: 'P1', hand: [], faceUpCards: [], faceDownCards: [card('7')], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'FLIP_FACE_DOWN',
        playerId: 'player-0',
        cardIndex: 5, // Invalid index
      });

      expect(newState).toBe(state);
    });

    it('declares winner when last face-down card is played successfully', () => {
      const state = createPlayingState({
        pyre: [],
        players: [
          { id: 'player-0', name: 'P1', hand: [], faceUpCards: [], faceDownCards: [card('7')], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'FLIP_FACE_DOWN',
        playerId: 'player-0',
        cardIndex: 0,
      });

      expect(newState.phase).toBe('finished');
      expect(newState.winner).toBe('player-0');
    });

    it('does not win if flipped card fails to play', () => {
      const state = createPlayingState({
        pyre: [card('A')],
        players: [
          { id: 'player-0', name: 'P1', hand: [], faceUpCards: [], faceDownCards: [card('5')], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'FLIP_FACE_DOWN',
        playerId: 'player-0',
        cardIndex: 0, // 5 cannot play on A
      });

      expect(newState.phase).toBe('playing');
      expect(newState.winner).toBeNull();
    });

    it('burns pyre when flipping a 10', () => {
      const state = createPlayingState({
        pyre: [card('K')],
        players: [
          { id: 'player-0', name: 'P1', hand: [], faceUpCards: [], faceDownCards: [card('10')], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'FLIP_FACE_DOWN',
        playerId: 'player-0',
        cardIndex: 0,
      });

      expect(newState.pyre).toHaveLength(0);
      expect(newState.turnHistory[0].type).toBe('burn');
    });

    it('reverses direction when flipping an 8', () => {
      const state = createPlayingState({
        pyre: [card('K')],
        direction: 1,
        players: [
          { id: 'player-0', name: 'P1', hand: [], faceUpCards: [], faceDownCards: [card('8')], isConnected: true },
          { id: 'player-1', name: 'P2', hand: [card('6')], faceUpCards: [], faceDownCards: [], isConnected: true },
          { id: 'player-2', name: 'P3', hand: [card('7')], faceUpCards: [], faceDownCards: [], isConnected: true },
        ],
      });

      const newState = gameReducer(state, {
        type: 'FLIP_FACE_DOWN',
        playerId: 'player-0',
        cardIndex: 0,
      });

      expect(newState.direction).toBe(-1);
      expect(newState.turnHistory[0].type).toBe('reverse');
    });
  });

  describe('RESET_GAME', () => {
    it('returns to initial game state', () => {
      const playingState = createPlayingState();

      const newState = gameReducer(playingState, { type: 'RESET_GAME' });

      expect(newState).toEqual(initialGameState);
    });
  });
});
