import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GROUPS } from '@/features/club/groups-content';
import {
  storyBodyPlaceholderNote,
  storyChapter,
  storyPhotoCaption,
  storyPullQuote,
} from '@/features/club/story-content';
import { renderWithProviders } from '@/test/render';
import { ClubStory } from './ClubStory';

const getStory = (): HTMLElement => document.querySelector('[data-kk-club-story]') as HTMLElement;

describe('ClubStory', () => {
  it('renders the numbered chapter header title', () => {
    renderWithProviders(<ClubStory />);

    expect(screen.getByRole('heading', { level: 2, name: storyChapter.title })).toBeInTheDocument();
  });

  it('keeps the generic-true pull-quote', () => {
    renderWithProviders(<ClubStory />);

    expect(screen.getByText(storyPullQuote)).toBeInTheDocument();
  });

  it('flags the body copy as a placeholder for the real Vereinsgeschichte', () => {
    renderWithProviders(<ClubStory />);

    expect(screen.getByText(storyBodyPlaceholderNote)).toBeInTheDocument();
    expect(getStory().querySelector('[data-kk-story-placeholder]')).not.toBeNull();
  });

  it('shows the group-count stat derived from the GROUPS array', () => {
    renderWithProviders(<ClubStory />);

    const stats = getStory().querySelector('[data-kk-story-stats]') as HTMLElement;
    expect(within(stats).getByText(String(GROUPS.length))).toBeInTheDocument();
    expect(within(stats).getByText('Gruppen')).toBeInTheDocument();
  });

  it('frames the club photo placeholder', () => {
    renderWithProviders(<ClubStory />);

    expect(within(getStory()).getByText(storyPhotoCaption)).toBeInTheDocument();
  });
});
