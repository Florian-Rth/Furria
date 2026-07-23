import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PEOPLE, peopleChapter } from '@/features/club/people-content';
import { renderWithProviders } from '@/test/render';
import { PeopleWall } from './PeopleWall';

const getPeople = (): HTMLElement => document.querySelector('[data-kk-people]') as HTMLElement;

describe('PeopleWall', () => {
  it('renders the numbered chapter header title', () => {
    renderWithProviders(<PeopleWall />);

    expect(
      screen.getByRole('heading', { level: 2, name: peopleChapter.title }),
    ).toBeInTheDocument();
  });

  it('renders one portrait per person in the array', () => {
    renderWithProviders(<PeopleWall />);

    expect(getPeople().querySelectorAll('[data-kk-person]')).toHaveLength(PEOPLE.length);
  });

  it('shows every Amt eyebrow and name from the array', () => {
    renderWithProviders(<PeopleWall />);

    for (const person of PEOPLE) {
      expect(within(getPeople()).getByText(person.amt)).toBeInTheDocument();
      expect(
        within(getPeople()).getByRole('heading', { level: 3, name: person.name }),
      ).toBeInTheDocument();
    }
  });

  it('never renders the forbidden Vorstand framing', () => {
    renderWithProviders(<PeopleWall />);

    expect(getPeople().innerHTML).not.toMatch(/Vorstand/i);
  });
});
