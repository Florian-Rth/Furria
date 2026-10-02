import { describe, expect, it } from 'vitest';
import { coverClipOf, flapPoseAt, leafShadeOf, ramp, revealClipOf } from './flap-pose';

describe('ramp', () => {
  it.each([
    [-5, 0, 10, 0],
    [0, 0, 10, 0],
    [5, 0, 10, 0.5],
    [10, 0, 10, 1],
    [20, 0, 10, 1],
  ])('ramps %d between %d and %d to %d', (value, from, to, expected) => {
    expect(ramp(value, from, to)).toBe(expected);
  });
});

describe('flapPoseAt', () => {
  it('rests with the old top up and nothing revealed', () => {
    expect(flapPoseAt(0)).toEqual({
      fall: -0,
      land: 90,
      reveal: 0,
      cover: 0,
      presence: 0,
      fallen: false,
    });
  });

  it('has the old top edge-on and the new top fully revealed at the hinge moment', () => {
    const pose = flapPoseAt(0.5);

    expect(pose.fall).toBe(-90);
    expect(pose.land).toBe(90);
    expect(pose.reveal).toBe(1);
    expect(pose.fallen).toBe(true);
    expect(pose.presence).toBeCloseTo(1);
  });

  it.each([0.6, 0.8, 0.9])('lands the new bottom before it rebounds at %d', (progress) => {
    expect(flapPoseAt(progress).land).toBeGreaterThan(0);
  });

  it('covers the old bottom completely once the flap has struck', () => {
    expect(flapPoseAt(0.95).cover).toBe(1);
  });

  it('settles flat and covered at the end', () => {
    const pose = flapPoseAt(1);

    expect(pose.land).toBeCloseTo(0);
    expect(pose.cover).toBe(1);
    expect(pose.presence).toBeCloseTo(0);
  });
});

describe('revealClipOf', () => {
  it.each([
    [0, 'inset(-40% -40% 100% -40%)'],
    [0.5, 'inset(-40% -40% 75% -40%)'],
    [1, 'inset(-40% -40% 50% -40%)'],
  ])('cuts the new top at reveal %d to %s', (reveal, expected) => {
    expect(
      revealClipOf({ fall: -45, land: 90, reveal, cover: 0, presence: 1, fallen: false }),
    ).toBe(expected);
  });
});

describe('coverClipOf', () => {
  it.each([
    [0, 'inset(50% -40% -40% -40%)'],
    [0.5, 'inset(75% -40% -40% -40%)'],
    [1, 'inset(100% -40% -40% -40%)'],
  ])('cuts the old bottom at cover %d to %s', (cover, expected) => {
    expect(coverClipOf({ fall: -90, land: 45, reveal: 1, cover, presence: 1, fallen: true })).toBe(
      expected,
    );
  });
});

describe('leafShadeOf', () => {
  it.each([
    [0, 0],
    [60, 0.2],
    [-90, 0.4],
    [90, 0.4],
  ])('shades a leaf tilted %d degrees to %d', (degrees, expected) => {
    expect(leafShadeOf(degrees)).toBeCloseTo(expected);
  });
});
