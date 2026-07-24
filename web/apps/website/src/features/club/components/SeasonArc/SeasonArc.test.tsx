import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SEASON_STEPS, seasonChapter } from '@/features/club/season-content';
import { renderWithProviders } from '@/test/render';
import { SeasonArc } from './SeasonArc';

const getSeason = (): HTMLElement => document.querySelector('[data-kk-season]') as HTMLElement;

describe('SeasonArc', () => {
  it('renders the numbered chapter header title', () => {
    renderWithProviders(<SeasonArc />);

    expect(
      screen.getByRole('heading', { level: 2, name: seasonChapter.title }),
    ).toBeInTheDocument();
  });

  it('renders one card per entry in the array', () => {
    renderWithProviders(<SeasonArc />);

    expect(getSeason().querySelectorAll('[data-kk-season-step]')).toHaveLength(SEASON_STEPS.length);
  });

  it('shows every step tag and title from the array', () => {
    renderWithProviders(<SeasonArc />);

    for (const step of SEASON_STEPS) {
      expect(within(getSeason()).getByText(step.tag)).toBeInTheDocument();
      expect(
        within(getSeason()).getByRole('heading', { level: 3, name: step.title }),
      ).toBeInTheDocument();
    }
  });

  it('accents only the first card', () => {
    renderWithProviders(<SeasonArc />);

    const accented = getSeason().querySelectorAll('[data-kk-season-accented]');
    expect(accented).toHaveLength(1);

    const firstCard = getSeason().querySelectorAll('[data-kk-season-step]')[0] as HTMLElement;
    expect(firstCard.hasAttribute('data-kk-season-accented')).toBe(true);
  });
});
