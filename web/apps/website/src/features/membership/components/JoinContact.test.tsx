import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  joinContactHref,
  joinContactLabel,
  joinContactNote,
  joinContactText,
  joinContactTitle,
} from '@/features/membership/contact-content';
import { renderWithProviders } from '@/test/render';
import { JoinContact } from './JoinContact';

describe('JoinContact', () => {
  it('heads the section and invites a question without an Antrag', () => {
    renderWithProviders(<JoinContact />);

    expect(screen.getByRole('heading', { level: 2, name: joinContactTitle })).toBeInTheDocument();
    expect(screen.getByText(joinContactText)).toBeInTheDocument();
  });

  it('offers exactly one channel, and it is the club address', () => {
    renderWithProviders(<JoinContact />);

    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', joinContactHref);
    expect(links[0]).toHaveTextContent(joinContactLabel);
  });

  it('says plainly that there is no number to call', () => {
    renderWithProviders(<JoinContact />);

    expect(screen.getByText(joinContactNote)).toBeInTheDocument();
  });
});
