import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  OnlineGameState,
  ClientPlayer,
  ClientMessage,
  ServerMessage,
  ConnectionState,
} from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

interface UseOnlineGameResult {
  connectionState: ConnectionState;
  roomCode: string | null;
  playerId: string | null;
  players: ClientPlayer[];
  gameState: OnlineGameState | null;
  isHost: boolean;
  error: string | null;
  isMyTurn: boolean;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  playCards: (cardIds: string[]) => void;
  playFaceUpCards: (cardIds: string[]) => void;
  pickupPyre: () => void;
  flipFaceDown: (cardIndex: number) => void;
}

export function useOnlineGame(): UseOnlineGameResult {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<ClientPlayer[]>([]);
  const [gameState, setGameState] = useState<OnlineGameState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionState('connecting');
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setConnectionState('connected');
      setError(null);
    };

    ws.onclose = () => {
      setConnectionState('disconnected');
      wsRef.current = null;
    };

    ws.onerror = () => {
      setConnectionState('error');
      setError('Connection failed');
    };

    ws.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    wsRef.current = ws;
  }, []);

  const handleMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case 'ROOM_CREATED':
        setRoomCode(message.roomCode);
        setPlayerId(message.playerId);
        setIsHost(true);
        setPlayers([]);
        break;

      case 'ROOM_JOINED':
        setRoomCode(message.roomCode);
        setPlayerId(message.playerId);
        setPlayers(message.players);
        setIsHost(false);
        break;

      case 'PLAYER_JOINED':
        setPlayers((prev) => [...prev, message.player]);
        break;

      case 'PLAYER_LEFT':
        setPlayers((prev) => prev.filter((p) => p.id !== message.playerId));
        break;

      case 'GAME_STATE':
        setGameState(message.state);
        break;

      case 'GAME_STARTED':
        // Game state will follow
        break;

      case 'YOUR_TURN':
        // Could trigger a notification
        break;

      case 'GAME_OVER':
        // Winner is in game state
        break;

      case 'ERROR':
        setError(message.message);
        break;
    }
  }, []);

  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const createRoom = useCallback(
    (playerName: string) => {
      connect();
      // Wait for connection then send
      const checkAndSend = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          send({ type: 'CREATE_ROOM', playerName });
        } else {
          setTimeout(checkAndSend, 100);
        }
      };
      checkAndSend();
    },
    [connect, send]
  );

  const joinRoom = useCallback(
    (code: string, playerName: string) => {
      connect();
      const checkAndSend = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          send({ type: 'JOIN_ROOM', roomCode: code.toUpperCase(), playerName });
        } else {
          setTimeout(checkAndSend, 100);
        }
      };
      checkAndSend();
    },
    [connect, send]
  );

  const leaveRoom = useCallback(() => {
    send({ type: 'LEAVE_ROOM' });
    setRoomCode(null);
    setPlayerId(null);
    setPlayers([]);
    setGameState(null);
    setIsHost(false);
  }, [send]);

  const startGame = useCallback(() => {
    send({ type: 'START_GAME' });
  }, [send]);

  const playCards = useCallback(
    (cardIds: string[]) => {
      send({ type: 'PLAY_CARDS', cardIds });
    },
    [send]
  );

  const playFaceUpCards = useCallback(
    (cardIds: string[]) => {
      send({ type: 'PLAY_FACE_UP_CARDS', cardIds });
    },
    [send]
  );

  const pickupPyre = useCallback(() => {
    send({ type: 'PICKUP_PYRE' });
  }, [send]);

  const flipFaceDown = useCallback(
    (cardIndex: number) => {
      send({ type: 'FLIP_FACE_DOWN', cardIndex });
    },
    [send]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const isMyTurn =
    gameState !== null &&
    gameState.players[gameState.currentPlayerIndex]?.id === playerId;

  return {
    connectionState,
    roomCode,
    playerId,
    players,
    gameState,
    isHost,
    error,
    isMyTurn,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    playCards,
    playFaceUpCards,
    pickupPyre,
    flipFaceDown,
  };
}
