import type { Card } from './card';
import type { Player } from './player';

export type GamePhase =
  | 'setup'
  | 'dealing'
  | 'discardingThrees'
  | 'playing'
  | 'finished';

export type PlayDirection = 1 | -1;

export interface TurnAction {
  playerId: string;
  type: 'play' | 'pickup' | 'discardThree' | 'burn' | 'flipFaceDown' | 'reverse';
  cards: Card[];
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  direction: PlayDirection;
  pyre: Card[];
  discardPile: Card[];
  turnHistory: TurnAction[];
  winner: string | null;
  firstThreeDiscarderId: string | null;
}

export type GameMode = 'local' | 'online';

export type GameAction =
  | { type: 'START_GAME'; playerNames: string[] }
  | { type: 'DISCARD_THREES'; playerId: string }
  | { type: 'FINISH_DISCARDING_THREES' }
  | { type: 'PLAY_CARDS'; playerId: string; cardIds: string[] }
  | { type: 'PICKUP_PYRE'; playerId: string }
  | { type: 'FLIP_FACE_DOWN'; playerId: string; cardIndex: number }
  | { type: 'RESET_GAME' };
