import type { Card, GameState, Player, TurnAction, Suit, Rank } from './types.js';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES: Record<Rank, number> = {
  '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15,
};
const FACE_DOWN_CARDS_COUNT = 4;

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${suit}-${rank}`, suit, rank });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function canPlayOn(cardToPlay: Card, topCard: Card | null): boolean {
  if (cardToPlay.rank === '2' || cardToPlay.rank === '10') return true;
  if (!topCard) return true;
  if (topCard.rank === '2') return true;
  return RANK_VALUES[cardToPlay.rank] >= RANK_VALUES[topCard.rank];
}

export function isValidPlay(cards: Card[], topCard: Card | null): boolean {
  if (cards.length === 0) return false;
  const firstRank = cards[0].rank;
  if (!cards.every((c) => c.rank === firstRank)) return false;
  return canPlayOn(cards[0], topCard);
}

export function isBurnCard(card: Card): boolean {
  return card.rank === '10';
}

export function createInitialGameState(playerInfos: { id: string; name: string }[]): GameState {
  const deck = shuffleDeck(createDeck());
  const players: Player[] = playerInfos.map(({ id, name }) => ({
    id,
    name,
    hand: [],
    faceDownCards: [],
    isConnected: true,
  }));

  // Deal 4 face-down cards to each player
  let deckIndex = 0;
  for (const player of players) {
    player.faceDownCards = deck.slice(deckIndex, deckIndex + FACE_DOWN_CARDS_COUNT);
    deckIndex += FACE_DOWN_CARDS_COUNT;
  }

  // Deal remaining cards to hands one at a time
  const remainingCards = deck.slice(deckIndex);
  let playerIndex = 0;
  for (const card of remainingCards) {
    players[playerIndex].hand.push(card);
    playerIndex = (playerIndex + 1) % players.length;
  }

  return {
    phase: 'discardingThrees',
    players,
    currentPlayerIndex: 0,
    pyre: [],
    discardPile: [],
    turnHistory: [],
    winner: null,
    firstThreeDiscarderId: null,
  };
}

export function discardThrees(state: GameState, playerId: string): GameState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return state;

  const player = state.players[playerIndex];
  const threes = player.hand.filter((c) => c.rank === '3');
  if (threes.length === 0) return state;

  const newHand = player.hand.filter((c) => c.rank !== '3');
  const newPlayers = [...state.players];
  newPlayers[playerIndex] = { ...player, hand: newHand };

  const turnAction: TurnAction = {
    playerId,
    type: 'discardThree',
    cards: threes,
    timestamp: Date.now(),
  };

  return {
    ...state,
    players: newPlayers,
    discardPile: [...state.discardPile, ...threes],
    turnHistory: [...state.turnHistory, turnAction],
    firstThreeDiscarderId: state.firstThreeDiscarderId ?? playerId,
  };
}

export function finishDiscardingThrees(state: GameState): GameState {
  let startingPlayerIndex = 0;
  if (state.firstThreeDiscarderId) {
    const discardIndex = state.players.findIndex((p) => p.id === state.firstThreeDiscarderId);
    if (discardIndex !== -1) {
      startingPlayerIndex = (discardIndex + 1) % state.players.length;
    }
  }
  return { ...state, phase: 'playing', currentPlayerIndex: startingPlayerIndex };
}

export function playCards(state: GameState, playerId: string, cardIds: string[]): GameState | null {
  if (state.phase !== 'playing') return null;

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) return null;

  const player = state.players[playerIndex];
  const cardsToPlay = cardIds
    .map((id) => player.hand.find((c) => c.id === id))
    .filter((c): c is Card => c !== undefined);

  if (cardsToPlay.length !== cardIds.length) return null;

  const topCard = state.pyre.length > 0 ? state.pyre[state.pyre.length - 1] : null;
  if (!isValidPlay(cardsToPlay, topCard)) return null;

  const newHand = player.hand.filter((c) => !cardIds.includes(c.id));
  const newPlayers = [...state.players];
  newPlayers[playerIndex] = { ...player, hand: newHand };

  const shouldBurn = cardsToPlay.some(isBurnCard);
  let newPyre: Card[];
  let newDiscardPile: Card[];
  let actionType: TurnAction['type'];

  if (shouldBurn) {
    newPyre = [];
    newDiscardPile = [...state.discardPile, ...state.pyre, ...cardsToPlay];
    actionType = 'burn';
  } else {
    newPyre = [...state.pyre, ...cardsToPlay];
    newDiscardPile = state.discardPile;
    actionType = 'play';
  }

  const turnAction: TurnAction = {
    playerId,
    type: actionType,
    cards: cardsToPlay,
    timestamp: Date.now(),
  };

  const updatedPlayer = newPlayers[playerIndex];
  if (updatedPlayer.hand.length === 0 && updatedPlayer.faceDownCards.length === 0) {
    return {
      ...state,
      phase: 'finished',
      players: newPlayers,
      pyre: newPyre,
      discardPile: newDiscardPile,
      turnHistory: [...state.turnHistory, turnAction],
      winner: playerId,
    };
  }

  const nextPlayerIndex = shouldBurn
    ? state.currentPlayerIndex
    : (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    players: newPlayers,
    pyre: newPyre,
    discardPile: newDiscardPile,
    currentPlayerIndex: nextPlayerIndex,
    turnHistory: [...state.turnHistory, turnAction],
  };
}

export function pickupPyre(state: GameState, playerId: string): GameState | null {
  if (state.phase !== 'playing') return null;

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) return null;
  if (state.pyre.length === 0) return null;

  const player = state.players[playerIndex];
  const newHand = [...player.hand, ...state.pyre];
  const newPlayers = [...state.players];
  newPlayers[playerIndex] = { ...player, hand: newHand };

  const turnAction: TurnAction = {
    playerId,
    type: 'pickup',
    cards: state.pyre,
    timestamp: Date.now(),
  };

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    players: newPlayers,
    pyre: [],
    currentPlayerIndex: nextPlayerIndex,
    turnHistory: [...state.turnHistory, turnAction],
  };
}

export function flipFaceDown(state: GameState, playerId: string, cardIndex: number): GameState | null {
  if (state.phase !== 'playing') return null;

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) return null;

  const player = state.players[playerIndex];
  if (player.hand.length > 0) return null;
  if (cardIndex < 0 || cardIndex >= player.faceDownCards.length) return null;

  const card = player.faceDownCards[cardIndex];
  const topCard = state.pyre.length > 0 ? state.pyre[state.pyre.length - 1] : null;

  const newFaceDownCards = [...player.faceDownCards];
  newFaceDownCards.splice(cardIndex, 1);

  const canPlay = isValidPlay([card], topCard);
  const shouldBurn = isBurnCard(card);

  let newPyre: Card[];
  let newDiscardPile: Card[];
  let newHand: Card[];
  let actionType: TurnAction['type'];
  let nextPlayerIndex: number;

  if (canPlay) {
    if (shouldBurn) {
      newPyre = [];
      newDiscardPile = [...state.discardPile, ...state.pyre, card];
      newHand = [];
      actionType = 'burn';
      nextPlayerIndex = state.currentPlayerIndex;
    } else {
      newPyre = [...state.pyre, card];
      newDiscardPile = state.discardPile;
      newHand = [];
      actionType = 'flipFaceDown';
      nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    }
  } else {
    newPyre = [];
    newHand = [...state.pyre, card];
    newDiscardPile = state.discardPile;
    actionType = 'pickup';
    nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  }

  const newPlayers = [...state.players];
  newPlayers[playerIndex] = {
    ...player,
    hand: newHand,
    faceDownCards: newFaceDownCards,
  };

  const turnAction: TurnAction = {
    playerId,
    type: actionType,
    cards: [card],
    timestamp: Date.now(),
  };

  const updatedPlayer = newPlayers[playerIndex];
  if (updatedPlayer.hand.length === 0 && updatedPlayer.faceDownCards.length === 0 && canPlay) {
    return {
      ...state,
      phase: 'finished',
      players: newPlayers,
      pyre: newPyre,
      discardPile: newDiscardPile,
      turnHistory: [...state.turnHistory, turnAction],
      winner: playerId,
    };
  }

  return {
    ...state,
    players: newPlayers,
    pyre: newPyre,
    discardPile: newDiscardPile,
    currentPlayerIndex: nextPlayerIndex,
    turnHistory: [...state.turnHistory, turnAction],
  };
}

export function hasThreesInHand(state: GameState, playerId: string): boolean {
  const player = state.players.find((p) => p.id === playerId);
  return player ? player.hand.some((c) => c.rank === '3') : false;
}
