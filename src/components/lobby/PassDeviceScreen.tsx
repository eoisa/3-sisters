import type { Player } from '../../types';
import { Button } from '../ui';

interface PassDeviceScreenProps {
  nextPlayer: Player;
  onReady: () => void;
}

export function PassDeviceScreen({ nextPlayer, onReady }: PassDeviceScreenProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            marginBottom: '16px',
            opacity: 0.8,
          }}
        >
          Pass the device to
        </div>
        <h1
          style={{
            fontSize: '48px',
            margin: '0 0 48px 0',
          }}
        >
          {nextPlayer.name}
        </h1>
        <Button variant="success" size="large" onClick={onReady}>
          I'm Ready
        </Button>
        <div
          style={{
            marginTop: '24px',
            fontSize: '14px',
            opacity: 0.6,
          }}
        >
          Make sure no one else can see your cards!
        </div>
      </div>
    </div>
  );
}
