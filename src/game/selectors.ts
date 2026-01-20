import type { GameState, Player, Card } from '../types';
import { isValidPlay } from '../utils/cardComparison';

export function getCurrentPlayer(state: GameState): Player | null {
  if (state.players.length === 0) return null;
  return state.players[state.currentPlayerIndex];
}

export function getPlayerById(state: GameState, playerId: string): Player | null {
  return state.players.find((p) => p.id === playerId) ?? null;
}

export function getTopPyreCard(state: GameState): Card | null {
  if (state.pyre.length === 0) return null;
  return state.pyre[state.pyre.length - 1];
}

export function canPlayerPlay(state: GameState, playerId: string): boolean {
  const player = getPlayerById(state, playerId);
  if (!player) return false;

  const topCard = getTopPyreCard(state);

  // Check if any card in hand can be played
  for (const card of player.hand) {
    if (isValidPlay([card], topCard)) {
      return true;
    }
  }

  return false;
}

export function getPlayableCards(state: GameState, playerId: string): Card[] {
  const player = getPlayerById(state, playerId);
  if (!player) return [];

  const topCard = getTopPyreCard(state);

  return player.hand.filter((card) => isValidPlay([card], topCard));
}

export function isPlayerTurn(state: GameState, playerId: string): boolean {
  const currentPlayer = getCurrentPlayer(state);
  return currentPlayer?.id === playerId;
}

export function hasThreesInHand(state: GameState, playerId: string): boolean {
  const player = getPlayerById(state, playerId);
  if (!player) return false;

  return player.hand.some((card) => card.rank === '3');
}

export function getWinner(state: GameState): Player | null {
  if (!state.winner) return null;
  return getPlayerById(state, state.winner);
}

export function getTotalCardsForPlayer(player: Player): number {
  return player.hand.length + player.faceDownCards.length;
}

export function isPlayingFaceDown(player: Player): boolean {
  return player.hand.length === 0 && player.faceDownCards.length > 0;
}
