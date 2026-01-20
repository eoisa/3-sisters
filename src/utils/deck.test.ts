import { describe, it, expect } from 'vitest';
import {
  createDeck,
  shuffleDeck,
  createCard,
  getCardById,
  removeCardsById,
} from './deck';
import type { Card } from '../types';

describe('createDeck', () => {
  it('creates a deck with 52 cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  it('contains all four suits', () => {
    const deck = createDeck();
    const suits = new Set(deck.map((c) => c.suit));

    expect(suits.has('hearts')).toBe(true);
    expect(suits.has('diamonds')).toBe(true);
    expect(suits.has('clubs')).toBe(true);
    expect(suits.has('spades')).toBe(true);
    expect(suits.size).toBe(4);
  });

  it('contains all 13 ranks', () => {
    const deck = createDeck();
    const ranks = new Set(deck.map((c) => c.rank));

    expect(ranks.has('2')).toBe(true);
    expect(ranks.has('3')).toBe(true);
    expect(ranks.has('4')).toBe(true);
    expect(ranks.has('5')).toBe(true);
    expect(ranks.has('6')).toBe(true);
    expect(ranks.has('7')).toBe(true);
    expect(ranks.has('8')).toBe(true);
    expect(ranks.has('9')).toBe(true);
    expect(ranks.has('10')).toBe(true);
    expect(ranks.has('J')).toBe(true);
    expect(ranks.has('Q')).toBe(true);
    expect(ranks.has('K')).toBe(true);
    expect(ranks.has('A')).toBe(true);
    expect(ranks.size).toBe(13);
  });

  it('has 13 cards of each suit', () => {
    const deck = createDeck();

    const heartCards = deck.filter((c) => c.suit === 'hearts');
    const diamondCards = deck.filter((c) => c.suit === 'diamonds');
    const clubCards = deck.filter((c) => c.suit === 'clubs');
    const spadeCards = deck.filter((c) => c.suit === 'spades');

    expect(heartCards).toHaveLength(13);
    expect(diamondCards).toHaveLength(13);
    expect(clubCards).toHaveLength(13);
    expect(spadeCards).toHaveLength(13);
  });

  it('has 4 cards of each rank', () => {
    const deck = createDeck();

    const twos = deck.filter((c) => c.rank === '2');
    const aces = deck.filter((c) => c.rank === 'A');
    const kings = deck.filter((c) => c.rank === 'K');

    expect(twos).toHaveLength(4);
    expect(aces).toHaveLength(4);
    expect(kings).toHaveLength(4);
  });

  it('has unique card IDs', () => {
    const deck = createDeck();
    const ids = deck.map((c) => c.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(52);
  });

  it('creates cards with correct ID format (suit-rank)', () => {
    const deck = createDeck();

    const aceOfSpades = deck.find((c) => c.suit === 'spades' && c.rank === 'A');
    expect(aceOfSpades?.id).toBe('spades-A');

    const twoOfHearts = deck.find((c) => c.suit === 'hearts' && c.rank === '2');
    expect(twoOfHearts?.id).toBe('hearts-2');
  });
});

describe('shuffleDeck', () => {
  it('returns a deck with the same number of cards', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);

    expect(shuffled).toHaveLength(52);
  });

  it('does not mutate the original deck', () => {
    const deck = createDeck();
    const originalFirstCard = deck[0];
    shuffleDeck(deck);

    expect(deck[0]).toBe(originalFirstCard);
  });

  it('contains all original cards', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);

    const originalIds = new Set(deck.map((c) => c.id));
    const shuffledIds = new Set(shuffled.map((c) => c.id));

    expect(shuffledIds.size).toBe(originalIds.size);
    for (const id of originalIds) {
      expect(shuffledIds.has(id)).toBe(true);
    }
  });

  it('produces deterministic results with the same seed', () => {
    const deck = createDeck();
    const shuffled1 = shuffleDeck(deck, 12345);
    const shuffled2 = shuffleDeck(deck, 12345);

    for (let i = 0; i < shuffled1.length; i++) {
      expect(shuffled1[i].id).toBe(shuffled2[i].id);
    }
  });

  it('produces different results with different seeds', () => {
    const deck = createDeck();
    const shuffled1 = shuffleDeck(deck, 12345);
    const shuffled2 = shuffleDeck(deck, 54321);

    // At least some cards should be in different positions
    let differences = 0;
    for (let i = 0; i < shuffled1.length; i++) {
      if (shuffled1[i].id !== shuffled2[i].id) {
        differences++;
      }
    }

    expect(differences).toBeGreaterThan(0);
  });

  it('changes the order of cards (with very high probability)', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);

    // Check that at least some cards are in different positions
    let samePosition = 0;
    for (let i = 0; i < deck.length; i++) {
      if (deck[i].id === shuffled[i].id) {
        samePosition++;
      }
    }

    // Extremely unlikely that more than 10 cards stay in place after a shuffle
    expect(samePosition).toBeLessThan(10);
  });
});

describe('createCard', () => {
  it('creates a card with the specified suit and rank', () => {
    const card = createCard('hearts', 'A');

    expect(card.suit).toBe('hearts');
    expect(card.rank).toBe('A');
  });

  it('generates correct ID format', () => {
    const card = createCard('spades', 'K');
    expect(card.id).toBe('spades-K');

    const card2 = createCard('diamonds', '10');
    expect(card2.id).toBe('diamonds-10');
  });
});

describe('getCardById', () => {
  it('finds a card by its ID', () => {
    const cards: Card[] = [
      { id: 'hearts-A', suit: 'hearts', rank: 'A' },
      { id: 'spades-K', suit: 'spades', rank: 'K' },
      { id: 'diamonds-7', suit: 'diamonds', rank: '7' },
    ];

    const found = getCardById(cards, 'spades-K');

    expect(found).toBeDefined();
    expect(found?.suit).toBe('spades');
    expect(found?.rank).toBe('K');
  });

  it('returns undefined when card is not found', () => {
    const cards: Card[] = [
      { id: 'hearts-A', suit: 'hearts', rank: 'A' },
    ];

    const found = getCardById(cards, 'clubs-2');

    expect(found).toBeUndefined();
  });

  it('returns undefined for empty array', () => {
    const found = getCardById([], 'hearts-A');
    expect(found).toBeUndefined();
  });
});

describe('removeCardsById', () => {
  it('removes specified cards by ID', () => {
    const cards: Card[] = [
      { id: 'hearts-A', suit: 'hearts', rank: 'A' },
      { id: 'spades-K', suit: 'spades', rank: 'K' },
      { id: 'diamonds-7', suit: 'diamonds', rank: '7' },
    ];

    const result = removeCardsById(cards, ['spades-K']);

    expect(result).toHaveLength(2);
    expect(result.find((c) => c.id === 'spades-K')).toBeUndefined();
    expect(result.find((c) => c.id === 'hearts-A')).toBeDefined();
    expect(result.find((c) => c.id === 'diamonds-7')).toBeDefined();
  });

  it('removes multiple cards', () => {
    const cards: Card[] = [
      { id: 'hearts-A', suit: 'hearts', rank: 'A' },
      { id: 'spades-K', suit: 'spades', rank: 'K' },
      { id: 'diamonds-7', suit: 'diamonds', rank: '7' },
    ];

    const result = removeCardsById(cards, ['spades-K', 'hearts-A']);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('diamonds-7');
  });

  it('does not mutate the original array', () => {
    const cards: Card[] = [
      { id: 'hearts-A', suit: 'hearts', rank: 'A' },
      { id: 'spades-K', suit: 'spades', rank: 'K' },
    ];

    const result = removeCardsById(cards, ['spades-K']);

    expect(cards).toHaveLength(2);
    expect(result).toHaveLength(1);
  });

  it('returns all cards when no IDs match', () => {
    const cards: Card[] = [
      { id: 'hearts-A', suit: 'hearts', rank: 'A' },
      { id: 'spades-K', suit: 'spades', rank: 'K' },
    ];

    const result = removeCardsById(cards, ['clubs-2']);

    expect(result).toHaveLength(2);
  });

  it('handles empty removal list', () => {
    const cards: Card[] = [
      { id: 'hearts-A', suit: 'hearts', rank: 'A' },
    ];

    const result = removeCardsById(cards, []);

    expect(result).toHaveLength(1);
  });

  it('handles empty cards array', () => {
    const result = removeCardsById([], ['hearts-A']);
    expect(result).toHaveLength(0);
  });
});
