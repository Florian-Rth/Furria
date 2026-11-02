import { describe, expect, it } from 'vitest';
import { momentumOf, rubberFollow, rubberScale } from './pan-bounds';

describe('rubberFollow', () => {
  it.each([
    { raw: 300, expected: 300 },
    { raw: -100, expected: -48.35 },
    { raw: 1100, expected: 1048.35 },
  ])('shows $raw as $expected within 0…1000 on a 400 px area', ({ raw, expected }) => {
    expect(rubberFollow(raw, { min: 0, max: 1000 }, 400)).toBeCloseTo(expected, 1);
  });

  it('pins to the lower bound when the content is shorter than the area', () => {
    expect(rubberFollow(0, { min: 0, max: -200 }, 400)).toBe(0);
  });
});

describe('rubberScale', () => {
  it.each([
    { raw: 2, expected: 2 },
    { raw: 8, expected: 5.27 },
    { raw: 0.5, expected: 0.76 },
  ])('resists zooming $raw past 1…4 as $expected', ({ raw, expected }) => {
    expect(rubberScale(raw, { min: 1, max: 4 })).toBeCloseTo(expected, 2);
  });
});

describe('momentumOf', () => {
  it.each([
    { bounds: { min: 0, max: 900 }, expected: { velocity: 1500, min: 0, max: 900 } },
    { bounds: { min: 0, max: -300 }, expected: { velocity: 1500, min: 0, max: 0 } },
  ])('converts the release speed to px/s within $bounds', ({ bounds, expected }) => {
    expect(momentumOf(1.5, bounds)).toMatchObject(expected);
  });
});
