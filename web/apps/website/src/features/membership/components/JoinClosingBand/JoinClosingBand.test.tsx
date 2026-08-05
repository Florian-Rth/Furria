import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { joinClosingBandContent } from '@/features/membership/closing-content';
import { renderWithRouter } from '@/test/render';
import { JoinClosingBand } from './JoinClosingBand';

describe('JoinClosingBand', () => {
  it('closes the page with one CTA into the Antrag', () => {
    renderWithRouter(<JoinClosingBand />);

    expect(
      screen.getByRole('heading', { level: 2, name: joinClosingBandContent.headline }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: joinClosingBandContent.ctaLabel })).toHaveAttribute(
      'href',
      joinClosingBandContent.ctaHref,
    );
  });

  it('repeats that nothing is charged yet', () => {
    renderWithRouter(<JoinClosingBand />);

    expect(screen.getByText(joinClosingBandContent.lead)).toBeInTheDocument();
  });
});
