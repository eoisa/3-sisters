import { describe, it, expect } from 'vitest';
import {
  canPlayOn,
  isValidPlay,
  isWildCard,
  isBurnCard,
  isReverseCard,
  getRankValue,
  compareCards,
  sortCardsByRank,
  getLastNonWildCard,
} from './cardComparison';
import type { Card } from '../types';

// Helper to create cards easily
function card(rank: Card['rank'], suit: Card['suit'] = 'hearts'): Card {
  return { id: `${suit}-${rank}`, suit, rank };
}

describe('getLastNonWildCard', () => {
  it('returns null for empty pyre', () => {
    expect(getLastNonWildCard([])).toBe(null);
  });

  it('returns the top card if it is not a wild', () => {
    expect(getLastNonWildCard([card('7')])).toEqual(card('7'));
    expect(getLastNonWildCard([card('4'), card('K')])).toEqual(card('K'));
  });

  it('returns the last non-wild card when top is a 2 (wild)', () => {
    expect(getLastNonWildCard([card('7'), card('2')])).toEqual(card('7'));
    expect(getLastNonWildCard([card('K'), card('2')])).toEqual(card('K'));
  });

  it('returns the last non-wild card when top is an 8 (reverse)', () => {
    expect(getLastNonWildCard([card('7'), card('8')])).toEqual(card('7'));
    expect(getLastNonWildCard([card('K'), card('8')])).toEqual(card('K'));
  });

  it('handles multiple wilds on top', () => {
    expect(getLastNonWildCard([card('7'), card('2'), card('8')])).toEqual(card('7'));
    expect(getLastNonWildCard([card('K'), card('8'), card('2'), card('8')])).toEqual(card('K'));
  });

  it('returns null if pyre is all wilds', () => {
    expect(getLastNonWildCard([card('2')])).toBe(null);
    expect(getLastNonWildCard([card('8')])).toBe(null);
    expect(getLastNonWildCard([card('2'), card('8'), card('2')])).toBe(null);
  });
});

describe('canPlayOn', () => {
  describe('special cards (always playable)', () => {
    it('allows 2 (wild) to be played on any card', () => {
      expect(canPlayOn(card('2'), [card('A')])).toBe(true);
      expect(canPlayOn(card('2'), [card('K')])).toBe(true);
      expect(canPlayOn(card('2'), [card('4')])).toBe(true);
    });

    it('allows 10 (burn) to be played on any card', () => {
      expect(canPlayOn(card('10'), [card('A')])).toBe(true);
      expect(canPlayOn(card('10'), [card('K')])).toBe(true);
      expect(canPlayOn(card('10'), [card('4')])).toBe(true);
    });

    it('allows 8 (reverse) to be played on any card', () => {
      expect(canPlayOn(card('8'), [card('A')])).toBe(true);
      expect(canPlayOn(card('8'), [card('K')])).toBe(true);
      expect(canPlayOn(card('8'), [card('4')])).toBe(true);
    });
  });

  describe('playing on empty pyre', () => {
    it('allows any card to be played on empty pyre', () => {
      expect(canPlayOn(card('4'), [])).toBe(true);
      expect(canPlayOn(card('A'), [])).toBe(true);
      expect(canPlayOn(card('J'), [])).toBe(true);
    });
  });

  describe('playing on wild cards (2 or 8) - must beat last non-wild', () => {
    it('requires beating the last non-wild card when a 2 is on top', () => {
      // Pyre: 7, then 2. Must beat the 7.
      expect(canPlayOn(card('7'), [card('7'), card('2')])).toBe(true);  // equal
      expect(canPlayOn(card('9'), [card('7'), card('2')])).toBe(true);  // higher
      expect(canPlayOn(card('5'), [card('7'), card('2')])).toBe(false); // lower
    });

    it('requires beating the last non-wild card when an 8 is on top', () => {
      // Pyre: K, then 8. Must beat the K.
      expect(canPlayOn(card('K'), [card('K'), card('8')])).toBe(true);  // equal
      expect(canPlayOn(card('A'), [card('K'), card('8')])).toBe(true);  // higher
      expect(canPlayOn(card('Q'), [card('K'), card('8')])).toBe(false); // lower
    });

    it('allows any card when pyre is all wilds', () => {
      expect(canPlayOn(card('4'), [card('2')])).toBe(true);
      expect(canPlayOn(card('4'), [card('8')])).toBe(true);
      expect(canPlayOn(card('4'), [card('2'), card('8'), card('2')])).toBe(true);
    });

    it('handles multiple wilds on top of non-wild', () => {
      // Pyre: 9, 2, 8, 2. Must beat the 9.
      expect(canPlayOn(card('9'), [card('9'), card('2'), card('8'), card('2')])).toBe(true);
      expect(canPlayOn(card('J'), [card('9'), card('2'), card('8'), card('2')])).toBe(true);
      expect(canPlayOn(card('6'), [card('9'), card('2'), card('8'), card('2')])).toBe(false);
    });
  });

  describe('normal rank comparison', () => {
    it('allows equal rank', () => {
      expect(canPlayOn(card('7'), [card('7')])).toBe(true);
      expect(canPlayOn(card('K'), [card('K')])).toBe(true);
    });

    it('allows higher rank', () => {
      expect(canPlayOn(card('9'), [card('7')])).toBe(true);
      expect(canPlayOn(card('A'), [card('K')])).toBe(true);
      expect(canPlayOn(card('K'), [card('4')])).toBe(true);
    });

    it('rejects lower rank', () => {
      expect(canPlayOn(card('6'), [card('7')])).toBe(false);
      expect(canPlayOn(card('4'), [card('A')])).toBe(false);
      expect(canPlayOn(card('J'), [card('Q')])).toBe(false);
    });
  });

  describe('rank ordering', () => {
    it('orders ranks correctly: 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2', () => {
      // 3 is lowest non-discarded rank
      expect(canPlayOn(card('4'), [card('3')])).toBe(true);

      // Face cards order
      expect(canPlayOn(card('J'), [card('10')])).toBe(true);
      expect(canPlayOn(card('Q'), [card('J')])).toBe(true);
      expect(canPlayOn(card('K'), [card('Q')])).toBe(true);
      expect(canPlayOn(card('A'), [card('K')])).toBe(true);

      // 2 is highest (wild)
      expect(canPlayOn(card('2'), [card('A')])).toBe(true);
    });
  });
});

describe('isValidPlay', () => {
  it('returns false for empty array', () => {
    expect(isValidPlay([], [])).toBe(false);
    expect(isValidPlay([], [card('7')])).toBe(false);
  });

  it('returns true for single valid card', () => {
    expect(isValidPlay([card('7')], [card('5')])).toBe(true);
    expect(isValidPlay([card('A')], [])).toBe(true);
  });

  it('returns false for single invalid card', () => {
    expect(isValidPlay([card('5')], [card('7')])).toBe(false);
  });

  it('allows multiple cards of the same rank', () => {
    expect(isValidPlay([card('7', 'hearts'), card('7', 'diamonds')], [card('5')])).toBe(true);
    expect(isValidPlay([card('K', 'hearts'), card('K', 'spades'), card('K', 'clubs')], [card('J')])).toBe(true);
  });

  it('rejects multiple cards of different ranks', () => {
    expect(isValidPlay([card('7'), card('9')], [])).toBe(false);
    expect(isValidPlay([card('K'), card('A')], [card('J')])).toBe(false);
  });

  it('validates multiple cards against last non-wild card', () => {
    // Multiple 6s cannot be played on a 7
    expect(isValidPlay([card('6', 'hearts'), card('6', 'diamonds')], [card('7')])).toBe(false);

    // Multiple 8s can be played on anything (reverse)
    expect(isValidPlay([card('8', 'hearts'), card('8', 'diamonds')], [card('A')])).toBe(true);
  });

  it('validates against last non-wild when wild is on top', () => {
    // Pyre: 7, 2. Multiple 6s cannot beat 7
    expect(isValidPlay([card('6', 'hearts'), card('6', 'diamonds')], [card('7'), card('2')])).toBe(false);
    // Multiple 9s can beat 7
    expect(isValidPlay([card('9', 'hearts'), card('9', 'diamonds')], [card('7'), card('2')])).toBe(true);
  });
});

describe('isWildCard', () => {
  it('returns true for 2s', () => {
    expect(isWildCard(card('2'))).toBe(true);
    expect(isWildCard(card('2', 'spades'))).toBe(true);
  });

  it('returns true for 8s (reverse wild)', () => {
    expect(isWildCard(card('8'))).toBe(true);
    expect(isWildCard(card('8', 'clubs'))).toBe(true);
  });

  it('returns false for other cards', () => {
    expect(isWildCard(card('3'))).toBe(false);
    expect(isWildCard(card('10'))).toBe(false);
    expect(isWildCard(card('A'))).toBe(false);
    expect(isWildCard(card('K'))).toBe(false);
  });
});

describe('isBurnCard', () => {
  it('returns true for 10s', () => {
    expect(isBurnCard(card('10'))).toBe(true);
    expect(isBurnCard(card('10', 'diamonds'))).toBe(true);
  });

  it('returns false for other cards', () => {
    expect(isBurnCard(card('2'))).toBe(false);
    expect(isBurnCard(card('8'))).toBe(false);
    expect(isBurnCard(card('A'))).toBe(false);
    expect(isBurnCard(card('9'))).toBe(false);
  });
});

describe('isReverseCard', () => {
  it('returns true for 8s', () => {
    expect(isReverseCard(card('8'))).toBe(true);
    expect(isReverseCard(card('8', 'clubs'))).toBe(true);
  });

  it('returns false for other cards', () => {
    expect(isReverseCard(card('2'))).toBe(false);
    expect(isReverseCard(card('10'))).toBe(false);
    expect(isReverseCard(card('7'))).toBe(false);
    expect(isReverseCard(card('9'))).toBe(false);
  });
});

describe('getRankValue', () => {
  it('returns correct values for all ranks', () => {
    expect(getRankValue('3')).toBe(3);
    expect(getRankValue('4')).toBe(4);
    expect(getRankValue('5')).toBe(5);
    expect(getRankValue('6')).toBe(6);
    expect(getRankValue('7')).toBe(7);
    expect(getRankValue('8')).toBe(8);
    expect(getRankValue('9')).toBe(9);
    expect(getRankValue('10')).toBe(10);
    expect(getRankValue('J')).toBe(11);
    expect(getRankValue('Q')).toBe(12);
    expect(getRankValue('K')).toBe(13);
    expect(getRankValue('A')).toBe(14);
    expect(getRankValue('2')).toBe(15);
  });
});

describe('compareCards', () => {
  it('returns negative when first card is lower', () => {
    expect(compareCards(card('4'), card('7'))).toBeLessThan(0);
    expect(compareCards(card('J'), card('K'))).toBeLessThan(0);
  });

  it('returns positive when first card is higher', () => {
    expect(compareCards(card('K'), card('J'))).toBeGreaterThan(0);
    expect(compareCards(card('A'), card('5'))).toBeGreaterThan(0);
  });

  it('returns zero for equal ranks', () => {
    expect(compareCards(card('7', 'hearts'), card('7', 'spades'))).toBe(0);
    expect(compareCards(card('K', 'diamonds'), card('K', 'clubs'))).toBe(0);
  });
});

describe('sortCardsByRank', () => {
  it('sorts cards from lowest to highest rank', () => {
    const cards = [card('K'), card('4'), card('A'), card('7')];
    const sorted = sortCardsByRank(cards);

    expect(sorted[0].rank).toBe('4');
    expect(sorted[1].rank).toBe('7');
    expect(sorted[2].rank).toBe('K');
    expect(sorted[3].rank).toBe('A');
  });

  it('does not mutate the original array', () => {
    const cards = [card('K'), card('4')];
    const sorted = sortCardsByRank(cards);

    expect(cards[0].rank).toBe('K');
    expect(sorted[0].rank).toBe('4');
  });

  it('handles empty array', () => {
    expect(sortCardsByRank([])).toEqual([]);
  });

  it('handles single card', () => {
    const cards = [card('J')];
    const sorted = sortCardsByRank(cards);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].rank).toBe('J');
  });
});
