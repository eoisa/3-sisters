import { Button } from '../ui';

interface HowToPlayProps {
  onBack: () => void;
}

export function HowToPlay({ onBack }: HowToPlayProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1b5e20 0%, #0d3d0f 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
      }}
    >
      <h1
        style={{
          color: 'white',
          fontSize: '36px',
          margin: '0 0 32px 0',
        }}
      >
        How to Play
      </h1>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '32px',
          width: '100%',
          maxWidth: '600px',
          color: 'white',
        }}
      >
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Overview</h2>
          <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
            3 Sisters is a card game for 3-8 players. The goal is to be the first player
            to get rid of all your cards. Games with 5+ players use two decks.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Setup</h2>
          <ul style={{ opacity: 0.9, lineHeight: 1.8, paddingLeft: '20px' }}>
            <li>Each player receives 3 face-down cards (you cannot look at these)</li>
            <li>Each player receives 3 face-up cards (visible to all players)</li>
            <li>The remaining cards are dealt to players' hands</li>
            <li>All 3s are automatically discarded at the start</li>
          </ul>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Special Cards</h2>
          <ul style={{ opacity: 0.9, lineHeight: 1.8, paddingLeft: '20px' }}>
            <li><strong>2s (Wild)</strong> - Can be played on any card, next player continues</li>
            <li><strong>8s (Wild)</strong> - Acts the same as a 2, as well as reversing the flow of the game</li>
            <li><strong>10s (Burn)</strong> - Discards the entire pyre, you go again</li>
          </ul>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Gameplay</h2>
          <ul style={{ opacity: 0.9, lineHeight: 1.8, paddingLeft: '20px' }}>
            <li>Play a card equal to or higher than the top card of the pyre</li>
            <li>You can play multiple cards if they're the same rank</li>
            <li>If you can't play, pick up the entire pyre</li>
            <li>When your hand is empty, play your face-up cards</li>
            <li>When face-up cards are gone, flip face-down cards one at a time</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Winning</h2>
          <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
            The first player to get rid of all their cards (hand, face-up, and face-down) wins!
          </p>
        </section>
      </div>

      <div style={{ marginTop: '32px' }}>
        <Button variant="primary" size="large" onClick={onBack}>
          Back to Menu
        </Button>
      </div>
    </div>
  );
}
