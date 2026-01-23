import type { GameState, GameAction, Player, Card, TurnAction, PlayDirection } from '../types';
import { FACE_DOWN_CARDS_COUNT, FACE_UP_CARDS_COUNT, DISCARD_RANK } from '../constants';
import { createDeck, shuffleDeck, removeCardsById, getCardById } from '../utils/deck';
import { isValidPlay, isBurnCard, isReverseCard } from '../utils/cardComparison';

export const initialGameState: GameState = {
  phase: 'setup',
  players: [],
  currentPlayerIndex: 0,
  direction: 1,
  pyre: [],
  discardPile: [],
  turnHistory: [],
  winner: null,
  firstThreeDiscarderId: null,
};

function getNextPlayerIndex(currentIndex: number, playerCount: number, direction: PlayDirection): number {
  return (currentIndex + direction + playerCount) % playerCount;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return startGame(state, action.playerNames);

    case 'DISCARD_THREES':
      return discardThrees(state, action.playerId);

    case 'FINISH_DISCARDING_THREES':
      return finishDiscardingThrees(state);

    case 'PLAY_CARDS':
      return playCards(state, action.playerId, action.cardIds);

    case 'PLAY_FACE_UP_CARDS':
      return playFaceUpCards(state, action.playerId, action.cardIds);

    case 'PICKUP_PYRE':
      return pickupPyre(state, action.playerId);

    case 'FLIP_FACE_DOWN':
      return flipFaceDown(state, action.playerId, action.cardIndex);

    case 'RESET_GAME':
      return initialGameState;

    default:
      return state;
  }
}

function startGame(state: GameState, playerNames: string[]): GameState {
  // Use two decks for 5+ players
  const deckCount = playerNames.length >= 5 ? 2 : 1;
  const deck = shuffleDeck(createDeck(deckCount));
  const players: Player[] = playerNames.map((name, index) => ({
    id: `player-${index}`,
    name,
    hand: [],
    faceUpCards: [],
    faceDownCards: [],
    isConnected: true,
  }));

  // Deal 3 face-down cards to each player
  let deckIndex = 0;
  for (const player of players) {
    player.faceDownCards = deck.slice(deckIndex, deckIndex + FACE_DOWN_CARDS_COUNT);
    deckIndex += FACE_DOWN_CARDS_COUNT;
  }

  // Deal 3 face-up cards to each player
  for (const player of players) {
    player.faceUpCards = deck.slice(deckIndex, deckIndex + FACE_UP_CARDS_COUNT);
    deckIndex += FACE_UP_CARDS_COUNT;
  }

  // Deal remaining cards to hands one at a time
  const remainingCards = deck.slice(deckIndex);
  let playerIndex = 0;
  for (const card of remainingCards) {
    players[playerIndex].hand.push(card);
    playerIndex = (playerIndex + 1) % players.length;
  }

  return {
    ...state,
    phase: 'discardingThrees',
    players,
    currentPlayerIndex: 0,
    direction: 1,
    pyre: [],
    discardPile: [],
    turnHistory: [],
    winner: null,
    firstThreeDiscarderId: null,
  };
}

function discardThrees(state: GameState, playerId: string): GameState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return state;

  const player = state.players[playerIndex];
  const threes = player.hand.filter((c) => c.rank === DISCARD_RANK);

  if (threes.length === 0) return state;

  const newHand = player.hand.filter((c) => c.rank !== DISCARD_RANK);
  const newDiscardPile = [...state.discardPile, ...threes];

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
    discardPile: newDiscardPile,
    turnHistory: [...state.turnHistory, turnAction],
    firstThreeDiscarderId: state.firstThreeDiscarderId ?? playerId,
  };
}

function finishDiscardingThrees(state: GameState): GameState {
  // Find the player to the left of the first person who discarded a 3
  let startingPlayerIndex = 0;

  if (state.firstThreeDiscarderId) {
    const discardIndex = state.players.findIndex(
      (p) => p.id === state.firstThreeDiscarderId
    );
    if (discardIndex !== -1) {
      startingPlayerIndex = (discardIndex + 1) % state.players.length;
    }
  }

  return {
    ...state,
    phase: 'playing',
    currentPlayerIndex: startingPlayerIndex,
  };
}

function playCards(state: GameState, playerId: string, cardIds: string[]): GameState {
  if (state.phase !== 'playing') return state;

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) return state;

  const player = state.players[playerIndex];
  const cardsToPlay = cardIds
    .map((id) => getCardById(player.hand, id))
    .filter((c): c is Card => c !== undefined);

  if (cardsToPlay.length !== cardIds.length) return state;

  // Validate the play
  if (!isValidPlay(cardsToPlay, state.pyre)) return state;

  // Remove cards from hand
  const newHand = removeCardsById(player.hand, cardIds);
  const newPlayers = [...state.players];
  newPlayers[playerIndex] = { ...player, hand: newHand };

  // Check if it's a burn (10) or reverse (8)
  const shouldBurn = cardsToPlay.some(isBurnCard);
  const shouldReverse = cardsToPlay.some(isReverseCard);

  let newPyre: Card[];
  let newDiscardPile: Card[];
  let actionType: TurnAction['type'];
  let newDirection: PlayDirection = state.direction;

  if (shouldBurn) {
    // Burn the pyre
    newPyre = [];
    newDiscardPile = [...state.discardPile, ...state.pyre, ...cardsToPlay];
    actionType = 'burn';
  } else if (shouldReverse) {
    // Reverse direction
    newPyre = [...state.pyre, ...cardsToPlay];
    newDiscardPile = state.discardPile;
    actionType = 'reverse';
    newDirection = (state.direction * -1) as PlayDirection;
  } else {
    // Add to pyre
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

  // Check for winner
  const updatedPlayer = newPlayers[playerIndex];
  if (
    updatedPlayer.hand.length === 0 &&
    updatedPlayer.faceUpCards.length === 0 &&
    updatedPlayer.faceDownCards.length === 0
  ) {
    return {
      ...state,
      phase: 'finished',
      players: newPlayers,
      pyre: newPyre,
      discardPile: newDiscardPile,
      direction: newDirection,
      turnHistory: [...state.turnHistory, turnAction],
      winner: playerId,
    };
  }

  // Move to next player (reverse uses new direction)
  // Burn does NOT advance - player gets to start the new pyre
  const nextPlayerIndex = shouldBurn
    ? state.currentPlayerIndex
    : getNextPlayerIndex(state.currentPlayerIndex, state.players.length, newDirection);

  return {
    ...state,
    players: newPlayers,
    pyre: newPyre,
    discardPile: newDiscardPile,
    direction: newDirection,
    currentPlayerIndex: nextPlayerIndex,
    turnHistory: [...state.turnHistory, turnAction],
  };
}

function playFaceUpCards(state: GameState, playerId: string, cardIds: string[]): GameState {
  if (state.phase !== 'playing') return state;

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) return state;

  const player = state.players[playerIndex];

  // Can only play face-up cards when hand is empty
  if (player.hand.length > 0) return state;

  // Must have face-up cards to play
  if (player.faceUpCards.length === 0) return state;

  // Face-up cards can only be played one at a time
  if (cardIds.length !== 1) return state;

  const cardsToPlay = cardIds
    .map((id) => getCardById(player.faceUpCards, id))
    .filter((c): c is Card => c !== undefined);

  if (cardsToPlay.length !== cardIds.length) return state;

  if (!isValidPlay(cardsToPlay, state.pyre)) return state;

  // Remove cards from face-up cards
  const newFaceUpCards = removeCardsById(player.faceUpCards, cardIds);
  const newPlayers = [...state.players];
  newPlayers[playerIndex] = { ...player, faceUpCards: newFaceUpCards };

  // Handle burn/reverse/normal play
  const shouldBurn = cardsToPlay.some(isBurnCard);
  const shouldReverse = cardsToPlay.some(isReverseCard);

  let newPyre: Card[];
  let newDiscardPile: Card[];
  let actionType: TurnAction['type'];
  let newDirection: PlayDirection = state.direction;

  if (shouldBurn) {
    newPyre = [];
    newDiscardPile = [...state.discardPile, ...state.pyre, ...cardsToPlay];
    actionType = 'burn';
  } else if (shouldReverse) {
    newPyre = [...state.pyre, ...cardsToPlay];
    newDiscardPile = state.discardPile;
    actionType = 'reverse';
    newDirection = (state.direction * -1) as PlayDirection;
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

  // Check for winner - must have empty hand, faceUpCards, AND faceDownCards
  const updatedPlayer = newPlayers[playerIndex];
  if (
    updatedPlayer.hand.length === 0 &&
    updatedPlayer.faceUpCards.length === 0 &&
    updatedPlayer.faceDownCards.length === 0
  ) {
    return {
      ...state,
      phase: 'finished',
      players: newPlayers,
      pyre: newPyre,
      discardPile: newDiscardPile,
      direction: newDirection,
      turnHistory: [...state.turnHistory, turnAction],
      winner: playerId,
    };
  }

  // Burn does NOT advance - player gets to start the new pyre
  const nextPlayerIndex = shouldBurn
    ? state.currentPlayerIndex
    : getNextPlayerIndex(state.currentPlayerIndex, state.players.length, newDirection);

  return {
    ...state,
    players: newPlayers,
    pyre: newPyre,
    discardPile: newDiscardPile,
    direction: newDirection,
    currentPlayerIndex: nextPlayerIndex,
    turnHistory: [...state.turnHistory, turnAction],
  };
}

function pickupPyre(state: GameState, playerId: string): GameState {
  if (state.phase !== 'playing') return state;

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) return state;
  if (state.pyre.length === 0) return state;

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

  // Move to next player
  const nextPlayerIndex = getNextPlayerIndex(
    state.currentPlayerIndex,
    state.players.length,
    state.direction
  );

  return {
    ...state,
    players: newPlayers,
    pyre: [],
    currentPlayerIndex: nextPlayerIndex,
    turnHistory: [...state.turnHistory, turnAction],
  };
}

function flipFaceDown(state: GameState, playerId: string, cardIndex: number): GameState {
  if (state.phase !== 'playing') return state;

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) return state;

  const player = state.players[playerIndex];

  // Can only flip face-down cards when hand AND face-up cards are empty
  if (player.hand.length > 0) return state;
  if (player.faceUpCards.length > 0) return state;
  if (cardIndex < 0 || cardIndex >= player.faceDownCards.length) return state;

  const card = player.faceDownCards[cardIndex];

  // Remove card from face-down
  const newFaceDownCards = [...player.faceDownCards];
  newFaceDownCards.splice(cardIndex, 1);

  // Check if the card can be played
  const canPlay = isValidPlay([card], state.pyre);
  const shouldBurn = isBurnCard(card);
  const shouldReverse = isReverseCard(card);

  let newPyre: Card[];
  let newDiscardPile: Card[];
  let newHand: Card[];
  let actionType: TurnAction['type'];
  let nextPlayerIndex: number;
  let newDirection: PlayDirection = state.direction;

  if (canPlay) {
    if (shouldBurn) {
      // Burn the pyre - player gets to start the new pyre
      newPyre = [];
      newDiscardPile = [...state.discardPile, ...state.pyre, card];
      newHand = [];
      actionType = 'burn';
      nextPlayerIndex = state.currentPlayerIndex;
    } else if (shouldReverse) {
      // Reverse direction
      newPyre = [...state.pyre, card];
      newDiscardPile = state.discardPile;
      newHand = [];
      actionType = 'reverse';
      newDirection = (state.direction * -1) as PlayDirection;
      nextPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, newDirection);
    } else {
      // Add to pyre
      newPyre = [...state.pyre, card];
      newDiscardPile = state.discardPile;
      newHand = [];
      actionType = 'flipFaceDown';
      nextPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.direction);
    }
  } else {
    // Card can't be played - pick up pyre including the flipped card
    newPyre = [];
    newHand = [...state.pyre, card];
    newDiscardPile = state.discardPile;
    actionType = 'pickup';
    nextPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.direction);
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

  // Check for winner
  const updatedPlayer = newPlayers[playerIndex];
  if (
    updatedPlayer.hand.length === 0 &&
    updatedPlayer.faceUpCards.length === 0 &&
    updatedPlayer.faceDownCards.length === 0 &&
    canPlay
  ) {
    return {
      ...state,
      phase: 'finished',
      players: newPlayers,
      pyre: newPyre,
      discardPile: newDiscardPile,
      direction: newDirection,
      turnHistory: [...state.turnHistory, turnAction],
      winner: playerId,
    };
  }

  return {
    ...state,
    players: newPlayers,
    pyre: newPyre,
    discardPile: newDiscardPile,
    direction: newDirection,
    currentPlayerIndex: nextPlayerIndex,
    turnHistory: [...state.turnHistory, turnAction],
  };
}
