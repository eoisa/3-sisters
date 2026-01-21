import type { GameState, Card, Rank } from '../types';
import { isValidPlay, sortCardsByRank, isBurnCard, isWildCard } from '../utils';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

interface AIDecision {
  action: 'play' | 'playFaceUp' | 'pickup' | 'flipFaceDown';
  cardIds?: string[];
  faceDownIndex?: number;
}

/**
 * AI player decision making for single player mode
 */
export function getAIDecision(
  state: GameState,
  playerId: string,
  difficulty: AIDifficulty = 'medium'
): AIDecision {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return { action: 'pickup' };
  }

  const pyreTopCard = state.pyre.length > 0 ? state.pyre[state.pyre.length - 1] : null;

  // If hand is empty but has face-up cards, play from face-up
  if (player.hand.length === 0 && player.faceUpCards.length > 0) {
    const playableFaceUpCards = findPlayableCards(player.faceUpCards, pyreTopCard);

    if (playableFaceUpCards.length === 0) {
      return { action: 'pickup' };
    }

    // Use same strategy as hand cards
    const cardsToPlay = chooseCardsToPlay(playableFaceUpCards, state.pyre, difficulty);

    if (cardsToPlay.length === 0) {
      return { action: 'pickup' };
    }

    return {
      action: 'playFaceUp',
      cardIds: cardsToPlay.map((c) => c.id),
    };
  }

  // If hand AND face-up cards are empty, must flip a face-down card
  if (player.hand.length === 0 && player.faceUpCards.length === 0 && player.faceDownCards.length > 0) {
    // Pick a random face-down card (we can't see them anyway)
    const index = Math.floor(Math.random() * player.faceDownCards.length);
    return { action: 'flipFaceDown', faceDownIndex: index };
  }

  // Find all playable cards from hand
  const playableCards = findPlayableCards(player.hand, pyreTopCard);

  if (playableCards.length === 0) {
    return { action: 'pickup' };
  }

  // Choose which cards to play based on difficulty
  const cardsToPlay = chooseCardsToPlay(playableCards, state.pyre, difficulty);

  if (cardsToPlay.length === 0) {
    return { action: 'pickup' };
  }

  return {
    action: 'play',
    cardIds: cardsToPlay.map((c) => c.id),
  };
}

function findPlayableCards(hand: Card[], topCard: Card | null): Card[] {
  return hand.filter((card) => isValidPlay([card], topCard));
}

function chooseCardsToPlay(
  playableCards: Card[],
  pyre: Card[],
  difficulty: AIDifficulty
): Card[] {
  // Group playable cards by rank
  const cardsByRank = new Map<Rank, Card[]>();
  for (const card of playableCards) {
    const existing = cardsByRank.get(card.rank) || [];
    existing.push(card);
    cardsByRank.set(card.rank, existing);
  }

  // Easy AI: plays randomly
  if (difficulty === 'easy') {
    return playRandomly(playableCards, cardsByRank);
  }

  // Medium AI: plays strategically but not perfectly
  if (difficulty === 'medium') {
    return playMediumStrategy(playableCards, cardsByRank, pyre);
  }

  // Hard AI: plays optimally
  return playHardStrategy(playableCards, cardsByRank, pyre);
}

function playRandomly(playableCards: Card[], cardsByRank: Map<Rank, Card[]>): Card[] {
  // Pick a random playable card
  const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
  const sameRankCards = cardsByRank.get(randomCard.rank) || [randomCard];

  // Sometimes play multiple of the same rank (50% chance)
  if (sameRankCards.length > 1 && Math.random() > 0.5) {
    // Play 1 to all of them
    const count = Math.floor(Math.random() * sameRankCards.length) + 1;
    return sameRankCards.slice(0, count);
  }

  return [randomCard];
}

function playMediumStrategy(
  playableCards: Card[],
  _cardsByRank: Map<Rank, Card[]>,
  pyre: Card[]
): Card[] {
  // Separate special cards
  const regularCards = playableCards.filter((c) => !isWildCard(c) && !isBurnCard(c));
  const wildCards = playableCards.filter((c) => isWildCard(c));
  const burnCards = playableCards.filter((c) => isBurnCard(c));

  // If pyre is large (5+ cards), consider burning it
  if (burnCards.length > 0 && pyre.length >= 5) {
    return [burnCards[0]];
  }

  // Prefer to play regular cards over special cards
  if (regularCards.length > 0) {
    // Sort by rank and play the lowest playable card(s)
    const sorted = sortCardsByRank(regularCards);
    const lowestRank = sorted[0].rank;
    const lowestCards = sorted.filter((c) => c.rank === lowestRank);

    // Play all cards of the lowest playable rank
    return lowestCards;
  }

  // If only special cards, prefer wild over burn (save burn for later)
  if (wildCards.length > 0) {
    return [wildCards[0]];
  }

  if (burnCards.length > 0) {
    return [burnCards[0]];
  }

  return [];
}

function playHardStrategy(
  playableCards: Card[],
  cardsByRank: Map<Rank, Card[]>,
  pyre: Card[]
): Card[] {
  const regularCards = playableCards.filter((c) => !isWildCard(c) && !isBurnCard(c));
  const wildCards = playableCards.filter((c) => isWildCard(c));
  const burnCards = playableCards.filter((c) => isBurnCard(c));

  // Strategic burn: use when pyre is large
  if (burnCards.length > 0) {
    const shouldBurn = pyre.length >= 4;
    if (shouldBurn) {
      return [burnCards[0]];
    }
  }

  // Look for opportunities to play multiple cards of the same rank
  if (regularCards.length > 0) {
    const sorted = sortCardsByRank(regularCards);

    // Find the best rank to play (lowest that has multiples, or just lowest)
    let bestRank = sorted[0].rank;
    let bestCount = 1;

    for (const [rank, cards] of cardsByRank) {
      if (cards.length > bestCount && !isWildCard(cards[0]) && !isBurnCard(cards[0])) {
        // Check if this rank is playable
        if (regularCards.some((c) => c.rank === rank)) {
          bestRank = rank;
          bestCount = cards.length;
        }
      }
    }

    // Play all cards of the best rank
    return regularCards.filter((c) => c.rank === bestRank);
  }

  // Save wilds for when really needed, but use if it's all we have
  if (wildCards.length > 0 && regularCards.length === 0) {
    return [wildCards[0]];
  }

  // Use burn as last resort for non-empty pyre
  if (burnCards.length > 0 && pyre.length > 0) {
    return [burnCards[0]];
  }

  // Fallback to wild
  if (wildCards.length > 0) {
    return [wildCards[0]];
  }

  return [];
}

/**
 * Add a delay to make AI feel more natural
 */
export function getAIThinkingTime(difficulty: AIDifficulty): number {
  switch (difficulty) {
    case 'easy':
      return 500 + Math.random() * 500; // 0.5-1s
    case 'medium':
      return 800 + Math.random() * 700; // 0.8-1.5s
    case 'hard':
      return 1000 + Math.random() * 1000; // 1-2s
  }
}

/**
 * Generate AI player names
 */
const AI_NAMES = [
  'Bot Alice',
  'Bot Bob',
  'Bot Charlie',
  'Bot Diana',
  'Bot Eve',
  'Bot Frank',
  'Bot Grace',
];

export function getAIPlayerName(index: number): string {
  return AI_NAMES[index % AI_NAMES.length];
}
