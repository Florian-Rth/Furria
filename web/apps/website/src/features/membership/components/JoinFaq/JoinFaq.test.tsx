import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  buildFaqPanelId,
  buildFaqQuestionId,
  JOIN_FAQ,
  joinFaqTitle,
} from '@/features/membership/faq-content';
import { renderWithProviders } from '@/test/render';
import { JoinFaq } from './JoinFaq';

const firstEntry = JOIN_FAQ[0];

describe('JoinFaq', () => {
  it('heads the section and lists every question', () => {
    renderWithProviders(<JoinFaq />);

    expect(screen.getByRole('heading', { level: 2, name: joinFaqTitle })).toBeInTheDocument();

    for (const entry of JOIN_FAQ) {
      expect(screen.getByRole('button', { name: entry.question })).toBeInTheDocument();
    }
  });

  it('keeps every answer collapsed until it is asked for', () => {
    renderWithProviders(<JoinFaq />);

    for (const entry of JOIN_FAQ) {
      expect(screen.getByRole('button', { name: entry.question })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    }
  });

  it('ties each summary to the region it controls', () => {
    renderWithProviders(<JoinFaq />);

    for (const entry of JOIN_FAQ) {
      const summary = screen.getByRole('button', { name: entry.question });

      expect(summary).toHaveAttribute('id', buildFaqQuestionId(entry.id));
      expect(summary).toHaveAttribute('aria-controls', buildFaqPanelId(entry.id));
    }
  });

  it('renders each question as a heading below the section title', () => {
    renderWithProviders(<JoinFaq />);

    for (const entry of JOIN_FAQ) {
      expect(screen.getByRole('heading', { level: 3, name: entry.question })).toBeInTheDocument();
    }
  });

  it('opens an answer from the keyboard alone', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JoinFaq />);

    const summary = screen.getByRole('button', { name: firstEntry?.question ?? '' });
    summary.focus();
    await user.keyboard('{Enter}');

    expect(summary).toHaveAttribute('aria-expanded', 'true');

    const panel = document.getElementById(buildFaqPanelId(firstEntry?.id ?? ''));

    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-labelledby', buildFaqQuestionId(firstEntry?.id ?? ''));
    expect(panel).toHaveTextContent(firstEntry?.answer ?? '');
  });

  it('closes the answer again on a second press', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JoinFaq />);

    const summary = screen.getByRole('button', { name: firstEntry?.question ?? '' });
    summary.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');

    expect(summary).toHaveAttribute('aria-expanded', 'false');
  });
});
