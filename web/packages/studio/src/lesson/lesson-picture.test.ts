import { describe, expect, it } from 'vitest';
import { cueCountOf, cueOfCount, lessonPictureOf } from './lesson-picture';

describe('lessonPictureOf', () => {
  it.each([
    {
      hero: 'video' as const,
      swapped: false,
      expected: { video: 'main', stage: 'inset', swappable: true },
    },
    {
      hero: 'video' as const,
      swapped: true,
      expected: { video: 'inset', stage: 'main', swappable: true },
    },
    {
      hero: 'stage' as const,
      swapped: false,
      expected: { video: 'off', stage: 'main', swappable: false },
    },
    {
      hero: 'stage' as const,
      swapped: true,
      expected: { video: 'off', stage: 'main', swappable: false },
    },
  ])('places video and stage for hero $hero, swapped $swapped', ({ hero, swapped, expected }) => {
    expect(lessonPictureOf(hero, swapped)).toEqual(expected);
  });
});

describe('cue round trip', () => {
  it.each([
    { cue: null, count: null },
    { cue: { tone: 'now' as const }, count: 0 },
    { cue: { tone: 'soon' as const, counts: 5 }, count: 5 },
  ])('carries $cue through a single number', ({ cue, count }) => {
    expect(cueCountOf(cue)).toBe(count);
    expect(cueOfCount(count)).toEqual(cue);
  });
});
