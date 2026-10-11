import { describe, expect, it } from 'vitest';
import { flapLeafOf, flapPoseAt, tileBandClipOf, turnedPoseOf } from './flap-pose';

const roundedClip = (clip: string): string =>
  clip.replace(/-?\d+(\.\d+)?/g, (value) => String(Math.round(Number(value) * 100) / 100));

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

describe('flapLeafOf', () => {
  it.each([
    [0, 'inset(0% 0% 100% 0%)'],
    [0.5, 'inset(-40% -40% 75% -40%)'],
  ])('cuts the new top at reveal %d to %s', (reveal, expected) => {
    expect(
      flapLeafOf({ fall: -45, land: 90, reveal, cover: 0, presence: 1, fallen: false }).revealClip,
    ).toBe(expected);
  });

  it.each([
    [0.5, 'inset(75% -40% -40% -40%)'],
    [1, 'inset(100% 0% 0% 0%)'],
  ])('cuts the old bottom at cover %d to %s', (cover, expected) => {
    expect(
      flapLeafOf({ fall: -90, land: 45, reveal: 1, cover, presence: 1, fallen: true }).coverClip,
    ).toBe(expected);
  });

  it.each([
    [0, 0],
    [60, 0.2],
    [90, 0.4],
  ])('shades a leaf tilted %d degrees to %d', (degrees, expected) => {
    const leaf = flapLeafOf({
      fall: -degrees,
      land: degrees,
      reveal: 1,
      cover: 0,
      presence: 1,
      fallen: false,
    });

    expect(leaf.fallShade).toBeCloseTo(expected);
    expect(leaf.landShade).toBeCloseTo(expected);
  });

  it.each([
    {
      progress: 0,
      fallOpacity: 1,
      landOpacity: 0,
      reveal: 'inset(0% 0% 100% 0%)',
      cover: 'inset(50% -40% -40% -40%)',
    },
    {
      progress: 0.25,
      fallOpacity: 1,
      landOpacity: 0,
      reveal: 'inset(-40% -40% 96.19% -40%)',
      cover: 'inset(50% -40% -40% -40%)',
    },
    {
      progress: 0.5,
      fallOpacity: 0,
      landOpacity: 1,
      reveal: 'inset(-40% -40% 50% -40%)',
      cover: 'inset(50% -40% -40% -40%)',
    },
    {
      progress: 0.75,
      fallOpacity: 0,
      landOpacity: 1,
      reveal: 'inset(-40% -40% 50% -40%)',
      cover: 'inset(80.08% -40% -40% -40%)',
    },
    {
      progress: 1,
      fallOpacity: 0,
      landOpacity: 1,
      reveal: 'inset(-40% -40% 50% -40%)',
      cover: 'inset(100% 0% 0% 0%)',
    },
  ])(
    'turns the old leaf away and the new one in at progress $progress',
    ({ progress, fallOpacity, landOpacity, reveal, cover }) => {
      const leaf = flapLeafOf(flapPoseAt(progress));

      expect([leaf.fallOpacity, leaf.landOpacity]).toEqual([fallOpacity, landOpacity]);
      expect(roundedClip(leaf.revealClip)).toBe(reveal);
      expect(roundedClip(leaf.coverClip)).toBe(cover);
    },
  );

  it.each([
    { progress: 0, fall: 0, land: 90, fallShade: 0, landShade: 0.4 },
    { progress: 0.25, fall: -22.5, land: 90, fallShade: 0.03, landShade: 0.4 },
    { progress: 0.5, fall: -90, land: 90, fallShade: 0.4, landShade: 0.4 },
    { progress: 0.75, fall: -90, land: 53.02, fallShade: 0.4, landShade: 0.16 },
    { progress: 1, fall: -90, land: 0, fallShade: 0.4, landShade: 0 },
  ])(
    'tilts and shades both leaves at progress $progress',
    ({ progress, fall, land, fallShade, landShade }) => {
      const leaf = flapLeafOf(flapPoseAt(progress));

      expect(leaf.fall).toBeCloseTo(fall, 2);
      expect(leaf.land).toBeCloseTo(land, 2);
      expect(leaf.fallShade).toBeCloseTo(fallShade, 2);
      expect(leaf.landShade).toBeCloseTo(landShade, 2);
    },
  );
});

describe('turnedPoseOf', () => {
  it.each([
    { fall: 0, reveal: 0, fallen: false },
    { fall: -60, reveal: 0.5, fallen: false },
    { fall: -90, reveal: 1, fallen: true },
  ])(
    'reveals $reveal of the next face behind a leaf at $fall degrees',
    ({ fall, reveal, fallen }) => {
      const pose = turnedPoseOf(fall, 90, 0, 1);

      expect(pose.reveal).toBeCloseTo(reveal);
      expect(pose.fallen).toBe(fallen);
    },
  );
});

describe('tileBandClipOf', () => {
  it.each([
    [-0.2, 'inset(50% -40% 50% -40%)'],
    [0.5, 'inset(19% -40% 19% -40%)'],
    [1, 'inset(-40% -40% -40% -40%)'],
  ])('opens the tile from its hinge at presence %d to %s', (presence, expected) => {
    expect(tileBandClipOf(presence)).toBe(expected);
  });
});
