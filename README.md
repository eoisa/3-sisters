# 3-sisters

Just a vibe-coded starter project to emulate the card game "3 sisters"

## Rules

### Players

3-8 players

### Equipment

- **3-4 players**: One standard 52-card deck with jokers removed, well shuffled.
- **5-8 players**: Two standard 52-card decks combined and well shuffled.

### Special Cards

- **2s** - Wild cards. Playing a 2 effectively skips to the next player.
- **8s** - Reverse wild cards. Playing an 8 reverses the direction of play and acts as a wild.
- **10s** - "Burn the pyre." Discards all cards currently in play and ends your turn.

### Setup

1. Deal 3 cards face down to each player. Players cannot look at these cards.
2. Deal 3 cards face up to each player, placed on top of the face-down cards. These are visible to all players.
3. Deal the remaining cards one at a time to each player until the deck is empty. These cards form each player's hand and can be looked at (but not shared with other players).

### Gameplay

1. **Starting the game:** All players discard any 3s from their hand. The player to the left of the first person to discard a 3 starts play.

2. **Playing cards:** On your turn, play a card higher than the last card played. You may play multiple cards if they are all the same rank, but you cannot play different cards together.

3. **Special plays:**
   - Play a **2** (wild) at any time - skips to the next player.
   - Play an **8** (reverse) at any time - reverses the direction of play and acts as a wild.
   - Play a **10** at any time - burns the pyre (discards all cards in play) and ends your turn.

4. **Picking up the pyre:** If you cannot play a card higher than the last one played (and don't have a 2, 8, or 10), you must pick up all cards in the pyre and add them to your hand.

5. **Face-up cards:** Once your hand is empty, you begin playing your face-up cards. These are visible to all players, so choose wisely!

6. **Face-down cards:** Once both your hand and face-up cards are empty, you begin playing your face-down cards. On your turn, choose one face-down card and flip it to play it.

### Winning

The first player to get rid of all their cards (hand, face-up, and face-down cards) wins the game.

## Features

- **Single Player**: Play against 2-7 AI opponents with three difficulty levels (Easy, Medium, Hard)
- **Local Game (Hotseat)**: 3-8 players can play on the same device, passing it between turns
- **Online Multiplayer**: Create/join rooms with codes, play over WebSockets
- **Full Game Logic**: Card dealing, 3s discarding, playing higher cards, wild 2s, reverse 8s, burning 10s, face-up cards, face-down card flipping
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

## Testing

```bash
npm test          # Run tests in watch mode
npm run test:run  # Run tests once
```

## Deployment

The app is designed for deployment on **Vercel** (frontend) + **Railway** (backend).

### Frontend (Vercel)

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set the root directory to `/` (default)
3. Add environment variable:
   - `VITE_WS_URL` = `wss://your-railway-app.railway.app` (your Railway WebSocket URL)
4. Deploy - Vercel auto-detects Vite and builds automatically

### Backend (Railway)

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Set the root directory to `/server`
3. Railway auto-detects Node.js and runs `npm run build` then `npm run start`
4. Note the public URL (e.g., `your-app.railway.app`) - use this for `VITE_WS_URL`

### Environment Variables

| Variable       | Service           | Description                                              |
|----------------|-------------------|----------------------------------------------------------|
| `VITE_WS_URL`  | Frontend (Vercel) | WebSocket server URL, e.g., `wss://your-app.railway.app` |
| `PORT`         | Backend (Railway) | Auto-set by Railway                                      |

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Framer Motion
- **Backend**: Node.js, WebSocket (ws)
- **Testing**: Vitest
- **Deployment**: Vercel (frontend), Railway (backend)

## Project Structure

```text
3-sisters/
├── src/                    # Frontend React app
│   ├── types/              # TypeScript types
│   ├── constants/          # Game constants
│   ├── utils/              # Deck and card utilities
│   ├── game/               # Game reducer, logic, and AI
│   ├── hooks/              # useLocalGame, useOnlineGame, useSinglePlayerGame
│   ├── context/            # GameContext
│   ├── components/         # UI components
│   │   ├── card/           # Card, CardHand, FaceUpCards, FaceDownCards
│   │   ├── player/         # PlayerArea, OpponentArea
│   │   ├── game/           # GameBoard, Pyre, etc.
│   │   └── lobby/          # MainMenu, LocalSetup, OnlineLobby
│   └── pages/              # LocalGame, SinglePlayerGame pages
├── server/                 # WebSocket multiplayer server
│   └── src/
│       ├── index.ts        # Server entry point
│       ├── Room.ts         # Game room management
│       ├── gameLogic.ts    # Server-side game logic
│       └── types.ts        # Server types
└── README.md               # Rules and setup instructions
```
