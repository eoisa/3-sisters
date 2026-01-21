import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainMenu } from './MainMenu';

describe('MainMenu', () => {
  const defaultProps = {
    onSinglePlayer: vi.fn(),
    onLocalGame: vi.fn(),
    onOnlineGame: vi.fn(),
    onHowToPlay: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('branding', () => {
    it('displays the logo image', () => {
      render(<MainMenu {...defaultProps} />);

      const logo = screen.getByAltText('3 Sisters Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/favicon.png');
    });

    it('displays the title "3 Sisters"', () => {
      render(<MainMenu {...defaultProps} />);

      expect(screen.getByRole('heading', { name: '3 Sisters' })).toBeInTheDocument();
    });

    it('displays the tagline', () => {
      render(<MainMenu {...defaultProps} />);

      expect(screen.getByText('A classic card game for 3-8 players')).toBeInTheDocument();
    });
  });

  describe('navigation buttons', () => {
    it('renders Single Player button', () => {
      render(<MainMenu {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Single Player' })).toBeInTheDocument();
    });

    it('renders Local Game button', () => {
      render(<MainMenu {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Local Game' })).toBeInTheDocument();
    });

    it('renders Online Game button', () => {
      render(<MainMenu {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Online Game' })).toBeInTheDocument();
    });

    it('renders How to Play button', () => {
      render(<MainMenu {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'How to Play' })).toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    it('calls onSinglePlayer when Single Player is clicked', async () => {
      const user = userEvent.setup();
      render(<MainMenu {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Single Player' }));

      expect(defaultProps.onSinglePlayer).toHaveBeenCalledTimes(1);
    });

    it('calls onLocalGame when Local Game is clicked', async () => {
      const user = userEvent.setup();
      render(<MainMenu {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Local Game' }));

      expect(defaultProps.onLocalGame).toHaveBeenCalledTimes(1);
    });

    it('calls onOnlineGame when Online Game is clicked', async () => {
      const user = userEvent.setup();
      render(<MainMenu {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Online Game' }));

      expect(defaultProps.onOnlineGame).toHaveBeenCalledTimes(1);
    });

    it('calls onHowToPlay when How to Play is clicked', async () => {
      const user = userEvent.setup();
      render(<MainMenu {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'How to Play' }));

      expect(defaultProps.onHowToPlay).toHaveBeenCalledTimes(1);
    });
  });
});
