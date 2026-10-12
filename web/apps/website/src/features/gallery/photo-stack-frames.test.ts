import { describe, expect, it } from 'vitest';
import type { PhotoStackFrameSpec } from './photo-stack-frames';
import {
  resolveFrameBottomPercent,
  resolvePhotoStackEntrance,
  resolveShownPhotoStackFrames,
} from './photo-stack-frames';

const frame = (overrides: Partial<PhotoStackFrameSpec>): PhotoStackFrameSpec => ({
  position: 1,
  aspect: 'portrait',
  leftPercent: 0,
  topPercent: 10,
  widthPercent: 40,
  rotation: -6,
  depth: 3,
  ...overrides,
});

describe('resolveFrameBottomPercent', () => {
  it.each<[PhotoStackFrameSpec, number]>([
    [frame({ aspect: 'portrait', topPercent: 10, widthPercent: 40 }), 60],
    [frame({ aspect: 'landscape', topPercent: 0, widthPercent: 70 }), 50],
  ])('places the bottom edge of %j at %d%', (spec, bottom) => {
    expect(resolveFrameBottomPercent(spec)).toBeCloseTo(bottom);
  });
});

describe('resolvePhotoStackEntrance', () => {
  it.each([
    [1, 0],
    [3, 0.18],
  ])('delays a frame at depth %i by %ds so the back frames settle first', (depth, delay) => {
    const { transition } = resolvePhotoStackEntrance(frame({ depth }), false);

    expect(transition.delay).toBeCloseTo(delay);
  });

  it('starts a reduced-motion stack already settled at its own rotation', () => {
    expect(resolvePhotoStackEntrance(frame({ rotation: -6 }), true)).toEqual({
      initial: { opacity: 1, rotate: -6, y: 0 },
      animate: { opacity: 1, rotate: -6, y: 0 },
      transition: { duration: 0 },
    });
  });
});

describe('resolveShownPhotoStackFrames', () => {
  it.each<[number[], number | null, number[]]>([
    [[1, 2, 3], 1, [2, 3]],
    [[2], null, [2]],
    [[1, 3], 1, [3]],
  ])('frames the positions %j as lead %j and fan %j', (positions, lead, fanned) => {
    const shown = resolveShownPhotoStackFrames(positions, true);

    expect(shown.lead?.spec.position ?? null).toBe(lead);
    expect(shown.fanned.map((frame) => frame.spec.position)).toEqual(fanned);
  });
});
