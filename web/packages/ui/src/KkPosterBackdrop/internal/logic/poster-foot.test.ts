import { describe, expect, it } from 'vitest';
import type { KkPosterPhase } from './poster-composition';
import { elevenDensityOf, footPlacementsOf, posterPlatesOf } from './poster-foot';

describe('elevenDensityOf', () => {
  it.each<[KkPosterPhase, number, number]>([
    ['runUp', 0, 0.42],
    ['runUp', 0.5, 0.86],
    ['runUp', 1, 1.3],
    ['opening', 0, 1.3],
    ['hall', 0, 1],
  ])('prints the %s eleven at run-up %d with density %d', (phase, runUp, density) => {
    expect(elevenDensityOf(phase, runUp)).toBeCloseTo(density, 5);
  });
});

describe('footPlacementsOf', () => {
  it.each<[number, number]>([
    [0, 0.42],
    [1, 1.3],
  ])('thickens the eleven with a run-up share of %d', (runUp, density) => {
    const eleven = footPlacementsOf('runUp', runUp).find(
      (placement) => placement.motif === 'eleven',
    );

    expect(eleven?.density).toBeCloseTo(density, 5);
  });

  it('keeps every other motif at full density', () => {
    const others = footPlacementsOf('hotDays', 0).filter(
      (placement) => placement.motif !== 'eleven',
    );

    expect(others.every((placement) => placement.density === 1)).toBe(true);
  });
});

describe('posterPlatesOf', () => {
  it.each<[KkPosterPhase, boolean, string[]]>([
    ['ashWednesday', false, ['ink']],
    ['offSeason', false, ['red', 'ink']],
    ['hotDays', false, ['red', 'ink', 'gold']],
  ])('inks the %s poster with %s', (phase, evening, plates) => {
    expect(posterPlatesOf(phase, evening).map((inking) => inking.plate)).toEqual(plates);
  });

  it('greys the ash wednesday poster', () => {
    expect(posterPlatesOf('ashWednesday', false).every((inking) => inking.ashen)).toBe(true);
  });
});
