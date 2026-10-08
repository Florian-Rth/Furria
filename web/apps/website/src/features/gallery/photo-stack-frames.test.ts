import { describe, expect, it } from 'vitest';
import type { PhotoStackFrameSpec } from './photo-stack-frames';
import { resolveFrameBottomPercent, resolvePhotoStackEntrance } from './photo-stack-frames';

const frame = (overrides: Partial<PhotoStackFrameSpec>): PhotoStackFrameSpec => ({
  label: 'foto',
  orientation: 'portrait',
  leftPercent: 0,
  topPercent: 10,
  widthPercent: 40,
  rotation: -6,
  depth: 3,
  ...overrides,
});

describe('resolveFrameBottomPercent', () => {
  it.each<[PhotoStackFrameSpec, number]>([
    [frame({ orientation: 'portrait', topPercent: 10, widthPercent: 40 }), 60],
    [frame({ orientation: 'landscape', topPercent: 0, widthPercent: 70 }), 50],
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
