import { kkTheme } from '@furria/ui';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LandingPage } from './LandingPage';

interface RenderOptions {
  onCtaClick?: () => void;
  confettiPaused?: boolean;
}

const renderLandingPage = ({
  onCtaClick = () => {},
  confettiPaused = false,
}: RenderOptions = {}): HTMLElement => {
  const { container } = render(
    <ThemeProvider theme={kkTheme}>
      <LandingPage onCtaClick={onCtaClick} confettiPaused={confettiPaused} />
    </ThemeProvider>,
  );

  return container;
};

describe('LandingPage', () => {
  it('renders the FURRIA wordmark in the masthead', () => {
    renderLandingPage();

    expect(screen.getByText('FURRIA')).toBeInTheDocument();
  });

  it('renders the two-tone German teaser headline', () => {
    renderLandingPage();

    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveTextContent('DIE FÜNFTE JAHRESZEIT');
    expect(headline).toHaveTextContent('BEGINNT HIER.');
  });

  it('notifies the caller when the access button is clicked', async () => {
    const user = userEvent.setup();
    const onCtaClick = vi.fn();
    renderLandingPage({ onCtaClick });

    await user.click(screen.getByRole('button', { name: 'Einlass' }));

    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });

  it('pauses the confetti rain when requested', () => {
    const container = renderLandingPage({ confettiPaused: true });

    const piece = container.querySelector('[aria-hidden="true"] > span');
    expect(piece).toHaveStyle({ animationPlayState: 'paused' });
  });
});
