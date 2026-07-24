import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { chronikChapter, MILESTONES } from '@/features/club/chronik-content';
import { renderWithProviders } from '@/test/render';
import { ChronikTimeline } from './ChronikTimeline';

const getChronik = (): HTMLElement => document.querySelector('[data-kk-chronik]') as HTMLElement;

describe('ChronikTimeline', () => {
  it('renders the numbered chapter header title', () => {
    renderWithProviders(<ChronikTimeline />);

    expect(
      screen.getByRole('heading', { level: 2, name: chronikChapter.title }),
    ).toBeInTheDocument();
  });

  it('renders one milestone per entry in the array', () => {
    renderWithProviders(<ChronikTimeline />);

    expect(getChronik().querySelectorAll('[data-kk-chronik-milestone]')).toHaveLength(
      MILESTONES.length,
    );
  });

  it('shows every milestone year and title from the array', () => {
    renderWithProviders(<ChronikTimeline />);

    for (const milestone of MILESTONES) {
      expect(within(getChronik()).getByText(milestone.year)).toBeInTheDocument();
      expect(
        within(getChronik()).getByRole('heading', { level: 3, name: milestone.title }),
      ).toBeInTheDocument();
    }
  });

  it('flags exactly the placeholder milestones for the club to replace', () => {
    renderWithProviders(<ChronikTimeline />);

    const flags = getChronik().querySelectorAll('[data-kk-chronik-placeholder]');
    const placeholders = MILESTONES.filter((milestone) => milestone.isPlaceholder);
    expect(flags).toHaveLength(placeholders.length);
  });

  it('draws the vertical spine that carries the milestone dots', () => {
    renderWithProviders(<ChronikTimeline />);

    expect(getChronik().querySelector('[data-kk-chronik-spine]')).not.toBeNull();
  });
});
