import type { Card } from './card';

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  faceUpCards: Card[];
  faceDownCards: Card[];
  isConnected: boolean;
}
