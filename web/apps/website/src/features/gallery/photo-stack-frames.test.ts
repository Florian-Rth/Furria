import { describe, expect, it } from 'vitest';
import type { PhotoStackFrameSpec } from './photo-stack-frames';
import {
  fannedPhotoStackFrames,
  leadPhotoStackFrame,
  photoStackHeightPercent,
  resolveFrameBottomPercent,
  resolveFrameHeightPercent,
  resolvePhotoStackEntrance,
} from './photo-stack-frames';

const allFrames = [leadPhotoStackFrame, ...fannedPhotoStackFrames];

const rotatedHorizontalSpan = (spec: PhotoStackFrameSpec): { left: number; right: number } => {
  const radians = (Math.abs(spec.rotation) * Math.PI) / 180;
  const halfWidth = spec.widthPercent / 2;
  const halfHeight = resolveFrameHeightPercent(spec) / 2;
  const rotatedHalfWidth = halfWidth * Math.cos(radians) + halfHeight * Math.sin(radians);
  const centre = spec.leftPercent + halfWidth;

  return { left: centre - rotatedHalfWidth, right: centre + rotatedHalfWidth };
};

const delayOf = (spec: PhotoStackFrameSpec): number => {
  const { transition } = resolvePhotoStackEntrance(spec, false);

  return typeof transition.delay === 'number' ? transition.delay : Number.NaN;
};

describe('photo stack frames', () => {
  it('gives every frame a unique label and depth', () => {
    expect(new Set(allFrames.map((spec) => spec.label)).size).toBe(allFrames.length);
    expect(new Set(allFrames.map((spec) => spec.depth)).size).toBe(allFrames.length);
  });

  it('fans the frames by tilting each one', () => {
    for (const spec of allFrames) {
      expect(spec.rotation).not.toBe(0);
    }
  });

  it('keeps the lead frame in front of the fanned ones', () => {
    for (const spec of fannedPhotoStackFrames) {
      expect(leadPhotoStackFrame.depth).toBeGreaterThan(spec.depth);
    }
  });

  it('keeps every tilted frame inside the stack width', () => {
    for (const spec of allFrames) {
      const span = rotatedHorizontalSpan(spec);
      expect(span.left).toBeGreaterThanOrEqual(0);
      expect(span.right).toBeLessThanOrEqual(100);
    }
  });

  it('keeps every tilted frame inside the stack height', () => {
    for (const spec of allFrames) {
      expect(resolveFrameBottomPercent(spec)).toBeLessThanOrEqual(photoStackHeightPercent);
    }
  });

  it('leaves no empty band under the lowest frame', () => {
    const lowestBottom = Math.max(...allFrames.map(resolveFrameBottomPercent));

    expect(photoStackHeightPercent).toBe(lowestBottom);
  });
});

describe('resolvePhotoStackEntrance', () => {
  it('settles a frame at its own rotation', () => {
    const entrance = resolvePhotoStackEntrance(leadPhotoStackFrame, false);

    expect(entrance.animate).toEqual({ opacity: 1, rotate: leadPhotoStackFrame.rotation, y: 0 });
    expect(entrance.initial).toEqual({ opacity: 0, rotate: 0, y: 18 });
  });

  it('lets the fanned frames settle before the lead frame', () => {
    for (const spec of fannedPhotoStackFrames) {
      expect(delayOf(spec)).toBeLessThan(delayOf(leadPhotoStackFrame));
    }
  });

  it('starts a reduced-motion stack already settled', () => {
    const entrance = resolvePhotoStackEntrance(leadPhotoStackFrame, true);

    expect(entrance.initial).toEqual(entrance.animate);
    expect(entrance.transition).toEqual({ duration: 0 });
  });
});
