import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GROUPS, groupsChapter, groupsIntro } from '@/features/club/groups-content';
import { renderWithProviders } from '@/test/render';
import { GruppenGrid } from './GruppenGrid';

const getGruppen = (): HTMLElement => document.querySelector('[data-kk-gruppen]') as HTMLElement;

describe('GruppenGrid', () => {
  it('renders the numbered chapter header title', () => {
    renderWithProviders(<GruppenGrid />);

    expect(
      screen.getByRole('heading', { level: 2, name: groupsChapter.title }),
    ).toBeInTheDocument();
  });

  it('renders one tile per Gruppe in the array', () => {
    renderWithProviders(<GruppenGrid />);

    expect(getGruppen().querySelectorAll('[data-kk-gruppen-tile]')).toHaveLength(GROUPS.length);
  });

  it('shows every Gruppe title and blurb from the array', () => {
    renderWithProviders(<GruppenGrid />);

    for (const group of GROUPS) {
      expect(
        within(getGruppen()).getByRole('heading', { level: 3, name: group.title }),
      ).toBeInTheDocument();
      expect(within(getGruppen()).getByText(group.blurb)).toBeInTheDocument();
    }
  });

  it('numbers the tile badges positionally from 01', () => {
    renderWithProviders(<GruppenGrid />);

    expect(within(getGruppen()).getByText('01')).toBeInTheDocument();
    expect(
      within(getGruppen()).getByText(String(GROUPS.length).padStart(2, '0')),
    ).toBeInTheDocument();
  });

  it('surfaces the derived count so it stays in step with the stat strip', () => {
    renderWithProviders(<GruppenGrid />);

    expect(within(getGruppen()).getByText(groupsIntro)).toBeInTheDocument();
  });
});
