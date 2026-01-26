import type { Card, Rank } from '../types';
import { RANK_VALUES, WILD_RANK, BURN_RANK, REVERSE_RANK } from '../constants';

/**
 * Find the last non-wild card in the pyre.
 * Wild cards (2s and 8s) don't change the card requirement.
 */
export function getLastNonWildCard(pyre: Card[]): Card | null {
  for (let i = pyre.length - 1; i >= 0; i--) {
    const card = pyre[i];
    if (card.rank !== WILD_RANK && card.rank !== REVERSE_RANK) {
      return card;
    }
  }
  return null;
}

export function canPlayOn(cardToPlay: Card, pyre: Card[]): boolean {
  // 2s (wild), 8s (reverse wild), and 10s (burn) can always be played
  if (cardToPlay.rank === WILD_RANK || cardToPlay.rank === BURN_RANK || cardToPlay.rank === REVERSE_RANK) {
    return true;
  }

  // Find the last non-wild card to determine what we need to beat
  const cardToBeat = getLastNonWildCard(pyre);

  // If pyre is empty or all wilds, any card can be played
  if (!cardToBeat) {
    return true;
  }

  // Must play equal or higher rank than the last non-wild card
  return RANK_VALUES[cardToPlay.rank] >= RANK_VALUES[cardToBeat.rank];
}

export function isValidPlay(cards: Card[], pyre: Card[]): boolean {
  if (cards.length === 0) {
    return false;
  }

  // All cards must be the same rank
  const firstRank = cards[0].rank;
  if (!cards.every((c) => c.rank === firstRank)) {
    return false;
  }

  // Check if can play on pyre
  return canPlayOn(cards[0], pyre);
}

export function isWildCard(card: Card): boolean {
  return card.rank === WILD_RANK || card.rank === REVERSE_RANK;
}

export function isBurnCard(card: Card): boolean {
  return card.rank === BURN_RANK;
}

export function isReverseCard(card: Card): boolean {
  return card.rank === REVERSE_RANK;
}

export function getRankValue(rank: Rank): number {
  return RANK_VALUES[rank];
}

export function compareCards(a: Card, b: Card): number {
  return RANK_VALUES[a.rank] - RANK_VALUES[b.rank];
}

export function sortCardsByRank(cards: Card[]): Card[] {
  return [...cards].sort(compareCards);
}

/**
 * Sort cards with special cards (2s, 8s, 10s) moved to the right.
 * Normal cards are sorted by rank, then special cards are appended.
 */
export function sortCardsForHand(cards: Card[]): Card[] {
  const normalCards: Card[] = [];
  const specialCards: Card[] = [];

  for (const card of cards) {
    if (card.rank === WILD_RANK || card.rank === BURN_RANK || card.rank === REVERSE_RANK) {
      specialCards.push(card);
    } else {
      normalCards.push(card);
    }
  }

  // Sort normal cards by rank
  normalCards.sort(compareCards);
  // Sort special cards by rank (8s, then 10s, then 2s)
  specialCards.sort(compareCards);

  return [...normalCards, ...specialCards];
}

export function isSpecialCard(card: Card): boolean {
  return card.rank === WILD_RANK || card.rank === BURN_RANK || card.rank === REVERSE_RANK;
}

export function getSpecialCardEffect(card: Card): string | null {
  if (card.rank === WILD_RANK) return 'Skips turn';
  if (card.rank === REVERSE_RANK) return 'Reverses flow';
  if (card.rank === BURN_RANK) return 'Burns pyre';
  return null;
}
