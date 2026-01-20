export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  faceDownCards: Card[];
  isConnected: boolean;
}

export type GamePhase =
  | 'waiting'
  | 'dealing'
  | 'discardingThrees'
  | 'playing'
  | 'finished';

export interface TurnAction {
  playerId: string;
  type: 'play' | 'pickup' | 'discardThree' | 'burn' | 'flipFaceDown';
  cards: Card[];
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  pyre: Card[];
  discardPile: Card[];
  turnHistory: TurnAction[];
  winner: string | null;
  firstThreeDiscarderId: string | null;
}

export type ClientMessage =
  | { type: 'CREATE_ROOM'; playerName: string }
  | { type: 'JOIN_ROOM'; roomCode: string; playerName: string }
  | { type: 'LEAVE_ROOM' }
  | { type: 'START_GAME' }
  | { type: 'PLAY_CARDS'; cardIds: string[] }
  | { type: 'PICKUP_PYRE' }
  | { type: 'FLIP_FACE_DOWN'; cardIndex: number };

export type ServerMessage =
  | { type: 'ROOM_CREATED'; roomCode: string; playerId: string }
  | { type: 'ROOM_JOINED'; roomCode: string; playerId: string; players: ClientPlayer[] }
  | { type: 'PLAYER_JOINED'; player: ClientPlayer }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'GAME_STATE'; state: ClientGameState }
  | { type: 'GAME_STARTED' }
  | { type: 'YOUR_TURN' }
  | { type: 'CARDS_PLAYED'; playerId: string; cards: Card[] }
  | { type: 'PYRE_PICKED_UP'; playerId: string }
  | { type: 'PYRE_BURNED'; playerId: string }
  | { type: 'GAME_OVER'; winnerId: string }
  | { type: 'ERROR'; message: string };

// Game state as seen by a specific client (hides other players' hands)
export interface ClientGameState {
  phase: GamePhase;
  players: ClientPlayer[];
  currentPlayerIndex: number;
  pyre: Card[];
  turnHistory: TurnAction[];
  winner: string | null;
  yourPlayerId: string;
  yourHand: Card[];
  yourFaceDownCards: Card[];
}

export interface ClientPlayer {
  id: string;
  name: string;
  handCount: number;
  faceDownCount: number;
  isConnected: boolean;
}
