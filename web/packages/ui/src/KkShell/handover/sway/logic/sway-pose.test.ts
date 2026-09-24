import { describe, expect, it } from 'vitest';
import type { SwayGlyph, SwayLetterPlan } from './sway-pose';
import {
  arrivalPoseAt,
  handoverProgressAt,
  letterPoseAt,
  letterProgressAt,
  lowerDueAt,
  lowerMixOf,
  restPoseAt,
  swayPlanOf,
} from './sway-pose';

const glyph = (char: string, left: number, line = 0): SwayGlyph => ({
  char,
  left,
  top: 0,
  width: 10,
  height: 20,
  line,
});

describe('handoverProgressAt', () => {
  it.each([
    [-10, 0],
    [0, 0],
    [36, 0.5],
    [72, 1],
    [200, 1],
  ])('maps scroll %d to %d', (scrollOffset, expected) => {
    expect(handoverProgressAt(scrollOffset, 72)).toBe(expected);
  });
});

describe('letterProgressAt', () => {
  it.each([
    [0, 0, 10, 0],
    [1, 9, 10, 1],
    [1, 0, 10, 1],
    [0.5, 0, 1, 0.5],
  ])('at %d letter %d of %d travels %d', (progress, index, count, expected) => {
    expect(letterProgressAt(progress, index, count)).toBe(expected);
  });

  it('lets the first letter lead the row', () => {
    expect(letterProgressAt(0.5, 0, 10)).toBeGreaterThan(letterProgressAt(0.5, 9, 10));
  });
});

describe('lowerDueAt', () => {
  it.each([
    [0, false],
    [0.44, false],
    [0.45, true],
    [1, true],
  ])('at %d turns lower %s', (progress, expected) => {
    expect(lowerDueAt(progress)).toBe(expected);
  });
});

describe('lowerMixOf', () => {
  const letter = (upper: string | null, lower: string | null): SwayLetterPlan => ({
    upper,
    lower,
    homeLeft: 0,
    homeTop: 0,
    dockLeft: 0,
    dockTop: 0,
    width: 10,
    height: 20,
  });

  it.each([
    ['M', 'M', false, 0],
    ['M', 'M', true, 1],
    [null, 'r', false, 1],
    ['R', null, true, 0],
  ])('mixes %s/%s lowered %s to %d', (upper, lower, lowered, expected) => {
    expect(lowerMixOf(letter(upper, lower), lowered)).toBe(expected);
  });
});

describe('letterPoseAt', () => {
  const letter: SwayLetterPlan = {
    upper: 'M',
    lower: 'M',
    homeLeft: 20,
    homeTop: 100,
    dockLeft: 60,
    dockTop: 30,
    width: 40,
    height: 50,
  };

  it('stands on the headline and scrolls with it before the travel', () => {
    expect(letterPoseAt(letter, 0, 1, 0, 0, 0.5)).toEqual({ x: 20, y: 100, scale: 1, presence: 1 });
  });

  it('lands scaled on the bar slot', () => {
    expect(letterPoseAt(letter, 0, 1, 1, 72, 0.5)).toEqual({
      x: 60 - 0.5 * 40 * 0.5,
      y: 30 - 0.8 * 50 * 0.5,
      scale: 0.5,
      presence: 1,
    });
  });

  it.each([
    [{ ...letter, lower: null }, 1, 0],
    [{ ...letter, upper: null }, 0, 0],
    [{ ...letter, upper: null }, 1, 1],
  ])('fades a letter without a partner (%o at %d)', (plan, progress, presence) => {
    expect(letterPoseAt(plan, 0, 1, progress, 0, 0.5).presence).toBe(presence);
  });
});

describe('restPoseAt', () => {
  it.each([
    [0, 0, 5, 0, 1],
    [0.5, 0, 5, -18, 0],
    [0.5, 4, 5, -18, 0],
    [1, 2, 5, -18, 0],
  ])('at %d letter %d of %d shifts %d at opacity %d', (progress, index, count, x, opacity) => {
    const pose = restPoseAt(progress, index, count);

    expect(pose.x).toBeCloseTo(x);
    expect(pose.opacity).toBeCloseTo(opacity);
  });

  it('lets the leftmost letter leave first', () => {
    expect(restPoseAt(0.2, 0, 5).opacity).toBeLessThan(restPoseAt(0.2, 4, 5).opacity);
  });
});

describe('arrivalPoseAt', () => {
  it.each([
    [0, 0, 5, 18, 0],
    [0.5, 4, 5, 18, 0],
    [1, 0, 5, 0, 1],
    [1, 4, 5, 0, 1],
  ])('at %d letter %d of %d stands %d off at opacity %d', (progress, index, count, x, opacity) => {
    const pose = arrivalPoseAt(progress, index, count);

    expect(pose.x).toBeCloseTo(x);
    expect(pose.opacity).toBeCloseTo(opacity);
  });

  it('lets the leftmost letter arrive first', () => {
    expect(arrivalPoseAt(0.7, 0, 5).opacity).toBeGreaterThan(arrivalPoseAt(0.7, 4, 5).opacity);
  });
});

describe('swayPlanOf', () => {
  it('pairs headline and bar letters by position and skips blanks', () => {
    const plan = swayPlanOf(
      [glyph('A', 0), glyph(' ', 10), glyph('B', 20)],
      { left: 100, top: 200 },
      [glyph('a', 0), glyph(' ', 5), glyph('b', 10)],
      { left: 10, top: 20 },
      0.5,
    );

    expect(plan.letters.map((letter) => [letter.upper, letter.lower])).toEqual([
      ['A', 'a'],
      ['B', 'b'],
    ]);
    expect(plan.letters.at(1)).toMatchObject({
      homeLeft: 120,
      homeTop: 200,
      dockLeft: 20,
      dockTop: 20,
    });
  });

  it('drops bar letters clipped past the first line', () => {
    const plan = swayPlanOf(
      [glyph('A', 0), glyph('B', 10)],
      { left: 0, top: 0 },
      [glyph('a', 0), glyph('b', 0, 1)],
      { left: 0, top: 0 },
      0.5,
    );

    expect(plan.letters.map((letter) => letter.lower)).toEqual(['a', null]);
  });

  it('derives the home of a bar-only letter from its dock', () => {
    const plan = swayPlanOf(
      [],
      { left: 100, top: 200 },
      [glyph('x', 30)],
      { left: 10, top: 20 },
      0.5,
    );

    expect(plan.letters.at(0)).toMatchObject({
      upper: null,
      homeLeft: 160,
      dockLeft: 40,
      width: 20,
      height: 40,
    });
  });
});
