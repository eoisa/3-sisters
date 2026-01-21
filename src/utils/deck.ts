import type { Card, Suit, Rank } from '../types';
import { SUITS, RANKS } from '../constants';

export function createDeck(deckCount: number = 1): Card[] {
  const deck: Card[] = [];

  for (let d = 0; d < deckCount; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          id: deckCount > 1 ? `${suit}-${rank}-${d}` : `${suit}-${rank}`,
          suit,
          rank,
        });
      }
    }
  }

  return deck;
}

export function shuffleDeck(deck: Card[], seed?: number): Card[] {
  const shuffled = [...deck];
  const random = seed !== undefined ? seededRandom(seed) : Math.random;

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function createCard(suit: Suit, rank: Rank): Card {
  return {
    id: `${suit}-${rank}`,
    suit,
    rank,
  };
}

export function getCardById(cards: Card[], id: string): Card | undefined {
  return cards.find((card) => card.id === id);
}

export function removeCardsById(cards: Card[], idsToRemove: string[]): Card[] {
  return cards.filter((card) => !idsToRemove.includes(card.id));
}
