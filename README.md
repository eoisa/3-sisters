# 3-sisters

Just a vibe-coded starter project to emulate the card game "3 sisters"

## Rules

### Players

3-8 players

### Equipment

Standard 52-card deck with jokers removed, well shuffled.

### Special Cards

- **2s** - Wild cards. Playing a 2 effectively skips to the next player.
- **10s** - "Burn the pyre." Discards all cards currently in play.

### Setup

1. Deal 4 cards face down to each player. Players cannot look at these cards.
2. Deal the remaining cards one at a time to each player until the deck is empty. These cards form each player's hand and can be looked at (but not shared with other players).

### Gameplay

1. **Starting the game:** All players discard any 3s from their hand. The player to the left of the first person to discard a 3 starts play.

2. **Playing cards:** On your turn, play a card higher than the last card played. You may play multiple cards if they are all the same rank, but you cannot play different cards together.

3. **Special plays:**
   - Play a **2** (wild) at any time - skips to the next player.
   - Play a **10** at any time - all cards in the pyre (cards in play that have been revealed) are discarded.

4. **Picking up the pyre:** If you cannot play a card higher than the last one played (and don't have a 2 or 10), you must pick up all cards in the pyre and add them to your hand.

5. **Face-down cards:** Once your hand is empty, you begin playing your face-down cards. On your turn, choose one face-down card and flip it to play it.

### Winning

The first player to get rid of all their cards (both hand and face-down cards) wins the game.

## Features

- **Local Game (Hotseat)**: 3-8 players can play on the same device, passing it between turns
- **Online Multiplayer**: Create/join rooms with codes, play over WebSockets
- **Full Game Logic**: Card dealing, 3s discarding, playing higher cards, wild 2s, burning 10s, face-down card flipping
- **Responsive UI**: Card hand fan layout, pyre display, game log, winner overlay

## Development

### Frontend (Local Game)

```bash
npm install
npm run dev
```

Open <http://localhost:5173> in your browser to play.

### Online Multiplayer

To play online multiplayer, you need to run the server:

```bash
# Terminal 1 - Install and start the server
cd server
npm install
npm run dev

# Terminal 2 - Start the frontend
npm run dev
```

The frontend will connect to `ws://localhost:3001` by default. To change this, set the `VITE_WS_URL` environment variable.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Framer Motion
- **Backend**: Node.js, WebSocket (ws)

## Project Structure

```text
3-sisters/
├── src/                    # Frontend React app
│   ├── types/              # TypeScript types
│   ├── constants/          # Game constants
│   ├── utils/              # Deck and card utilities
│   ├── game/               # Game reducer and logic
│   ├── hooks/              # useLocalGame, useOnlineGame
│   ├── context/            # GameContext
│   ├── components/         # UI components
│   │   ├── card/           # Card, CardHand, FaceDownCards
│   │   ├── player/         # PlayerArea, OpponentArea
│   │   ├── game/           # GameBoard, Pyre, etc.
│   │   └── lobby/          # MainMenu, LocalSetup, OnlineLobby
│   └── pages/              # LocalGame page
├── server/                 # WebSocket multiplayer server
│   └── src/
│       ├── index.ts        # Server entry point
│       ├── Room.ts         # Game room management
│       ├── gameLogic.ts    # Server-side game logic
│       └── types.ts        # Server types
└── README.md               # Rules and setup instructions
```
