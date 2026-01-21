import type { GamePhase, TurnAction } from './game';
import type { Card } from './card';

export interface ClientPlayer {
  id: string;
  name: string;
  handCount: number;
  faceUpCards: Card[];  // Visible to all players
  faceDownCount: number;
  isConnected: boolean;
}

export interface OnlineGameState {
  phase: GamePhase;
  players: ClientPlayer[];
  currentPlayerIndex: number;
  pyre: Card[];
  turnHistory: TurnAction[];
  winner: string | null;
  yourPlayerId: string;
  yourHand: Card[];
  yourFaceUpCards: Card[];
  yourFaceDownCards: Card[];
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export type ClientMessage =
  | { type: 'CREATE_ROOM'; playerName: string }
  | { type: 'JOIN_ROOM'; roomCode: string; playerName: string }
  | { type: 'LEAVE_ROOM' }
  | { type: 'START_GAME' }
  | { type: 'PLAY_CARDS'; cardIds: string[] }
  | { type: 'PLAY_FACE_UP_CARDS'; cardIds: string[] }
  | { type: 'PICKUP_PYRE' }
  | { type: 'FLIP_FACE_DOWN'; cardIndex: number };

export type ServerMessage =
  | { type: 'ROOM_CREATED'; roomCode: string; playerId: string }
  | { type: 'ROOM_JOINED'; roomCode: string; playerId: string; players: ClientPlayer[] }
  | { type: 'PLAYER_JOINED'; player: ClientPlayer }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'GAME_STATE'; state: OnlineGameState }
  | { type: 'GAME_STARTED' }
  | { type: 'YOUR_TURN' }
  | { type: 'CARDS_PLAYED'; playerId: string; cards: Card[] }
  | { type: 'PYRE_PICKED_UP'; playerId: string }
  | { type: 'PYRE_BURNED'; playerId: string }
  | { type: 'GAME_OVER'; winnerId: string }
  | { type: 'ERROR'; message: string };
