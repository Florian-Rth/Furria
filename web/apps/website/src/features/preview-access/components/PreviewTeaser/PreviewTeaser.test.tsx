import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { PreviewTeaser } from './PreviewTeaser';

interface RenderOptions {
  onCtaClick?: () => void;
  confettiPaused?: boolean;
}

const renderPreviewTeaser = ({
  onCtaClick = () => {},
  confettiPaused = false,
}: RenderOptions = {}): HTMLElement => {
  const { container } = renderWithProviders(
    <PreviewTeaser onCtaClick={onCtaClick} confettiPaused={confettiPaused} />,
  );

  return container;
};

describe('PreviewTeaser', () => {
  it('renders the FURRIA wordmark in the masthead', () => {
    renderPreviewTeaser();

    expect(screen.getByText('FURRIA')).toBeInTheDocument();
  });

  it('renders the two-tone German teaser headline', () => {
    renderPreviewTeaser();

    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveTextContent('DIE FÜNFTE JAHRESZEIT');
    expect(headline).toHaveTextContent('BEGINNT HIER.');
  });

  it('notifies the caller when the access button is clicked', async () => {
    const user = userEvent.setup();
    const onCtaClick = vi.fn();
    renderPreviewTeaser({ onCtaClick });

    await user.click(screen.getByRole('button', { name: 'Einlass' }));

    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });

  it('pauses the confetti rain when requested', () => {
    const container = renderPreviewTeaser({ confettiPaused: true });

    const piece = container.querySelector('[aria-hidden="true"] > span');
    expect(piece).toHaveStyle({ animationPlayState: 'paused' });
  });
});
