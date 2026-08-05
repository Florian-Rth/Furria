import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { JOIN_STEPS, joinStepsTitle } from '@/features/membership/steps-content';
import { renderWithProviders } from '@/test/render';
import { JoinSteps } from './JoinSteps';

describe('JoinSteps', () => {
  it('heads the section with the four-step ladder', () => {
    renderWithProviders(<JoinSteps />);

    expect(screen.getByRole('heading', { level: 2, name: joinStepsTitle })).toBeInTheDocument();
  });

  it('walks all four steps in order and numbers them', () => {
    renderWithProviders(<JoinSteps />);

    for (const step of JOIN_STEPS) {
      expect(screen.getByRole('heading', { level: 3, name: step.title })).toBeInTheDocument();
      expect(screen.getByText(step.description)).toBeInTheDocument();
    }

    const numerals = [...document.querySelectorAll('[data-kk-join-step-numeral]')].map(
      (numeral) => numeral.textContent,
    );

    expect(numerals).toEqual(['01', '02', '03', '04']);
  });
});
