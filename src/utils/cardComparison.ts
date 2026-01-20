import type { Card, Rank } from '../types';
import { RANK_VALUES, WILD_RANK, BURN_RANK, REVERSE_RANK } from '../constants';

export function canPlayOn(cardToPlay: Card, topCard: Card | null): boolean {
  // 2s (wild), 8s (reverse wild), and 10s (burn) can always be played
  if (cardToPlay.rank === WILD_RANK || cardToPlay.rank === BURN_RANK || cardToPlay.rank === REVERSE_RANK) {
    return true;
  }

  // If pyre is empty, any card can be played
  if (!topCard) {
    return true;
  }

  // If top card is a 2 (wild) or 8 (reverse), any card can be played on it
  if (topCard.rank === WILD_RANK || topCard.rank === REVERSE_RANK) {
    return true;
  }

  // Must play equal or higher rank
  return RANK_VALUES[cardToPlay.rank] >= RANK_VALUES[topCard.rank];
}

export function isValidPlay(cards: Card[], topCard: Card | null): boolean {
  if (cards.length === 0) {
    return false;
  }

  // All cards must be the same rank
  const firstRank = cards[0].rank;
  if (!cards.every((c) => c.rank === firstRank)) {
    return false;
  }

  // Check if can play on top card
  return canPlayOn(cards[0], topCard);
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
