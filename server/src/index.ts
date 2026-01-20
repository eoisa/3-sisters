import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Room } from './Room.js';
import type { ClientMessage, ServerMessage } from './types.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const wss = new WebSocketServer({ port: PORT });
const rooms = new Map<string, Room>();
const playerRooms = new Map<WebSocket, { roomCode: string; playerId: string }>();

console.log(`WebSocket server running on port ${PORT}`);

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  ws.on('message', (data: Buffer) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());
      handleMessage(ws, message);
    } catch (error) {
      console.error('Error parsing message:', error);
      sendError(ws, 'Invalid message format');
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    handleDisconnect(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleMessage(ws: WebSocket, message: ClientMessage): void {
  switch (message.type) {
    case 'CREATE_ROOM':
      handleCreateRoom(ws, message.playerName);
      break;

    case 'JOIN_ROOM':
      handleJoinRoom(ws, message.roomCode, message.playerName);
      break;

    case 'LEAVE_ROOM':
      handleLeaveRoom(ws);
      break;

    default:
      // Forward game actions to the room
      const playerInfo = playerRooms.get(ws);
      if (playerInfo) {
        const room = rooms.get(playerInfo.roomCode);
        if (room) {
          room.handleMessage(playerInfo.playerId, message);
        }
      }
      break;
  }
}

function handleCreateRoom(ws: WebSocket, playerName: string): void {
  const playerId = uuidv4();
  const room = new Room(playerId, playerName, ws);

  rooms.set(room.code, room);
  playerRooms.set(ws, { roomCode: room.code, playerId });

  send(ws, {
    type: 'ROOM_CREATED',
    roomCode: room.code,
    playerId,
  });

  console.log(`Room ${room.code} created by ${playerName}`);
}

function handleJoinRoom(ws: WebSocket, roomCode: string, playerName: string): void {
  const room = rooms.get(roomCode.toUpperCase());

  if (!room) {
    sendError(ws, 'Room not found');
    return;
  }

  const playerId = uuidv4();
  const success = room.addPlayer(playerId, playerName, ws);

  if (success) {
    playerRooms.set(ws, { roomCode: room.code, playerId });
    console.log(`${playerName} joined room ${room.code}`);
  }
}

function handleLeaveRoom(ws: WebSocket): void {
  const playerInfo = playerRooms.get(ws);
  if (!playerInfo) return;

  const room = rooms.get(playerInfo.roomCode);
  if (room) {
    room.removePlayer(playerInfo.playerId);

    if (room.isEmpty) {
      rooms.delete(playerInfo.roomCode);
      console.log(`Room ${playerInfo.roomCode} deleted (empty)`);
    }
  }

  playerRooms.delete(ws);
}

function handleDisconnect(ws: WebSocket): void {
  handleLeaveRoom(ws);
}

function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws: WebSocket, message: string): void {
  send(ws, { type: 'ERROR', message });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  wss.close(() => {
    process.exit(0);
  });
});
