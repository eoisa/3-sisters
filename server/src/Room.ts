import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import type { GameState, ClientGameState, ClientPlayer, ServerMessage, ClientMessage } from './types.js';
import {
  createInitialGameState,
  discardThrees,
  finishDiscardingThrees,
  playCards,
  pickupPyre,
  flipFaceDown,
  hasThreesInHand,
} from './gameLogic.js';

interface ConnectedPlayer {
  id: string;
  name: string;
  ws: WebSocket;
}

export class Room {
  code: string;
  hostId: string;
  players: Map<string, ConnectedPlayer> = new Map();
  gameState: GameState | null = null;

  constructor(hostId: string, hostName: string, hostWs: WebSocket) {
    this.code = this.generateRoomCode();
    this.hostId = hostId;
    this.players.set(hostId, { id: hostId, name: hostName, ws: hostWs });
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  addPlayer(playerId: string, playerName: string, ws: WebSocket): boolean {
    if (this.gameState !== null) {
      this.send(ws, { type: 'ERROR', message: 'Game already in progress' });
      return false;
    }

    if (this.players.size >= 8) {
      this.send(ws, { type: 'ERROR', message: 'Room is full' });
      return false;
    }

    this.players.set(playerId, { id: playerId, name: playerName, ws });

    // Notify existing players
    this.broadcast({
      type: 'PLAYER_JOINED',
      player: { id: playerId, name: playerName, handCount: 0, faceDownCount: 0, isConnected: true },
    }, playerId);

    // Send room info to new player
    const playersList = Array.from(this.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      handCount: 0,
      faceDownCount: 0,
      isConnected: true,
    }));

    this.send(ws, {
      type: 'ROOM_JOINED',
      roomCode: this.code,
      playerId,
      players: playersList,
    });

    return true;
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);

    if (this.gameState) {
      const player = this.gameState.players.find((p) => p.id === playerId);
      if (player) {
        player.isConnected = false;
      }
    }

    this.broadcast({ type: 'PLAYER_LEFT', playerId });

    // Transfer host if needed
    if (playerId === this.hostId && this.players.size > 0) {
      this.hostId = this.players.keys().next().value!;
    }
  }

  startGame(): void {
    if (this.players.size < 3) {
      this.broadcastError('Need at least 3 players to start');
      return;
    }

    const playerInfos = Array.from(this.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
    }));

    this.gameState = createInitialGameState(playerInfos);

    // Auto-discard 3s
    this.processThreesDiscarding();

    // Send game state to all players
    this.broadcast({ type: 'GAME_STARTED' });
    this.sendGameStateToAll();
  }

  private processThreesDiscarding(): void {
    if (!this.gameState || this.gameState.phase !== 'discardingThrees') return;

    let changed = true;
    while (changed) {
      changed = false;
      for (const player of this.gameState.players) {
        if (hasThreesInHand(this.gameState, player.id)) {
          this.gameState = discardThrees(this.gameState, player.id);
          changed = true;
        }
      }
    }

    this.gameState = finishDiscardingThrees(this.gameState);
  }

  handleMessage(playerId: string, message: ClientMessage): void {
    const player = this.players.get(playerId);
    if (!player) return;

    switch (message.type) {
      case 'START_GAME':
        if (playerId === this.hostId) {
          this.startGame();
        } else {
          this.send(player.ws, { type: 'ERROR', message: 'Only host can start the game' });
        }
        break;

      case 'PLAY_CARDS':
        this.handlePlayCards(playerId, message.cardIds);
        break;

      case 'PICKUP_PYRE':
        this.handlePickupPyre(playerId);
        break;

      case 'FLIP_FACE_DOWN':
        this.handleFlipFaceDown(playerId, message.cardIndex);
        break;
    }
  }

  private handlePlayCards(playerId: string, cardIds: string[]): void {
    if (!this.gameState) return;

    const newState = playCards(this.gameState, playerId, cardIds);
    if (newState) {
      const cards = this.gameState.players
        .find((p) => p.id === playerId)?.hand
        .filter((c) => cardIds.includes(c.id)) ?? [];

      this.gameState = newState;
      this.broadcast({ type: 'CARDS_PLAYED', playerId, cards });
      this.sendGameStateToAll();

      if (newState.phase === 'finished') {
        this.broadcast({ type: 'GAME_OVER', winnerId: newState.winner! });
      }
    } else {
      const player = this.players.get(playerId);
      if (player) {
        this.send(player.ws, { type: 'ERROR', message: 'Invalid play' });
      }
    }
  }

  private handlePickupPyre(playerId: string): void {
    if (!this.gameState) return;

    const newState = pickupPyre(this.gameState, playerId);
    if (newState) {
      this.gameState = newState;
      this.broadcast({ type: 'PYRE_PICKED_UP', playerId });
      this.sendGameStateToAll();
    } else {
      const player = this.players.get(playerId);
      if (player) {
        this.send(player.ws, { type: 'ERROR', message: 'Cannot pick up pyre' });
      }
    }
  }

  private handleFlipFaceDown(playerId: string, cardIndex: number): void {
    if (!this.gameState) return;

    const newState = flipFaceDown(this.gameState, playerId, cardIndex);
    if (newState) {
      this.gameState = newState;
      this.sendGameStateToAll();

      if (newState.phase === 'finished') {
        this.broadcast({ type: 'GAME_OVER', winnerId: newState.winner! });
      }
    } else {
      const player = this.players.get(playerId);
      if (player) {
        this.send(player.ws, { type: 'ERROR', message: 'Invalid flip' });
      }
    }
  }

  private sendGameStateToAll(): void {
    if (!this.gameState) return;

    for (const [playerId, player] of this.players) {
      const clientState = this.getClientGameState(playerId);
      this.send(player.ws, { type: 'GAME_STATE', state: clientState });

      // Notify if it's their turn
      if (this.gameState.players[this.gameState.currentPlayerIndex]?.id === playerId) {
        this.send(player.ws, { type: 'YOUR_TURN' });
      }
    }
  }

  private getClientGameState(forPlayerId: string): ClientGameState {
    if (!this.gameState) throw new Error('No game state');

    const playerData = this.gameState.players.find((p) => p.id === forPlayerId);

    const clientPlayers: ClientPlayer[] = this.gameState.players.map((p) => ({
      id: p.id,
      name: p.name,
      handCount: p.hand.length,
      faceDownCount: p.faceDownCards.length,
      isConnected: p.isConnected,
    }));

    return {
      phase: this.gameState.phase,
      players: clientPlayers,
      currentPlayerIndex: this.gameState.currentPlayerIndex,
      direction: this.gameState.direction,
      pyre: this.gameState.pyre,
      turnHistory: this.gameState.turnHistory,
      winner: this.gameState.winner,
      yourPlayerId: forPlayerId,
      yourHand: playerData?.hand ?? [],
      yourFaceDownCards: playerData?.faceDownCards ?? [],
    };
  }

  private send(ws: WebSocket, message: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcast(message: ServerMessage, excludePlayerId?: string): void {
    for (const [playerId, player] of this.players) {
      if (playerId !== excludePlayerId) {
        this.send(player.ws, message);
      }
    }
  }

  private broadcastError(message: string): void {
    this.broadcast({ type: 'ERROR', message });
  }

  get isEmpty(): boolean {
    return this.players.size === 0;
  }
}
