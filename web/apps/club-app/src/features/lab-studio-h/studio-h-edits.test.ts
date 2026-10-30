import { describe, expect, it } from 'vitest';
import type { TimedKeyframe } from '@/features/act-player/choreography-motion';
import type { StudioStep } from '@/features/acts/schemas';
import {
  borderMovedOf,
  draggedPointOf,
  moveIndexNear,
  offsetOf,
  placedTrackOf,
  retimedTrackOf,
} from './studio-h-edits';

const step = (stepId: number, start: number, end: number): StudioStep => ({
  stepId,
  name: `S${stepId}`,
  description: null,
  startSeconds: start,
  endSeconds: end,
  placement: 'onTimeline',
});

const key = (seconds: number, right: number, back: number): TimedKeyframe => ({
  seconds,
  position: { rightMetres: right, backMetres: back },
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

describe('borderMovedOf', () => {
  const steps = [step(1, 0, 4), step(2, 4, 8)];
  const marks = [0, 1, 2, 3, 4, 5, 6, 7].map((seconds) => ({ seconds, count: 1 }));

  it.each([
    [2.6, 3],
    [5.2, 5],
    [0.1, 1],
    [7.9, 7],
  ])('snaps the border dragged to %s onto the count at %s', (seconds, border) => {
    expect(borderMovedOf(steps, 1, seconds, marks)).toEqual({
      1: { start: 0, end: border },
      2: { start: border, end: 8 },
    });
  });

  it('keeps both neighbours at least half a second long', () => {
    expect(borderMovedOf(steps, 1, 0.2, [])).toEqual({
      1: { start: 0, end: 0.5 },
      2: { start: 0.5, end: 8 },
    });
  });

  it('moves nothing after the last step', () => {
    expect(borderMovedOf(steps, 2, 6, marks)).toEqual({});
  });
});

describe('placedTrackOf', () => {
  const track = [key(0, 0, 6), key(5, 0, 6), key(7, -4, 2), key(13, -4, 2), key(15, 1, 1)];

  it('moves the whole hold the step border belongs to', () => {
    const placed = placedTrackOf(track, 7, { rightMetres: 3, backMetres: 3 });

    expect(placed.map((keyframe) => keyframe.position.rightMetres)).toEqual([0, 0, 3, 3, 1]);
  });

  it('moves the opening hold before the first border', () => {
    const placed = placedTrackOf(track, 0, { rightMetres: 2, backMetres: 6 });

    expect(placed.map((keyframe) => keyframe.position.rightMetres)).toEqual([2, 2, -4, -4, 1]);
  });
});

describe('moveIndexNear', () => {
  const track = [key(0, 0, 0), key(2, 1, 0), key(4, 1, 0), key(6, 2, 0), key(10, 2, 0)];

  it.each([
    [0, 0],
    [3, 2],
    [9, 2],
  ])('picks the move a playhead at %s belongs to', (seconds, index) => {
    expect(moveIndexNear(track, { start: 0, end: 10 }, seconds)).toBe(index);
  });

  it('finds no move in a still step', () => {
    expect(moveIndexNear(track, { start: 6.5, end: 10 }, 7)).toBeNull();
  });
});

describe('retimedTrackOf', () => {
  const track = [key(0, 0, 0), key(2, 0, 0), key(4, 1, 0), key(8, 1, 0)];

  it('pulls the move onto the dragged counts', () => {
    expect(retimedTrackOf(track, 1, { start: 3, end: 6 }).map((k) => k.seconds)).toEqual([
      0, 3, 6, 8,
    ]);
  });

  it('never runs past the neighbouring keyframes', () => {
    const seconds = retimedTrackOf(track, 1, { start: -2, end: 12 }).map((k) => k.seconds);

    expect(seconds[1]).toBeCloseTo(0.001);
    expect(seconds[2]).toBeCloseTo(7.999);
  });
});

describe('draggedPointOf', () => {
  const stage = { widthMetres: 10, depthMetres: 8 };

  it.each([
    [
      { x: 0.1, y: 0.1 },
      { rightMetres: -1, backMetres: 2.75 },
    ],
    [
      { x: -1, y: 1 },
      { rightMetres: 5, backMetres: 8 },
    ],
  ])('moves a dot by %o in the dancers view', (delta, point) => {
    expect(draggedPointOf({ rightMetres: 0, backMetres: 2 }, delta, stage)).toEqual(point);
  });
});

describe('offsetOf', () => {
  it.each([
    [0.123, 10, 100, 0.1],
    [-30, 10, 100, -10],
    [95, 10, 100, 90],
  ])('rounds and bounds the offset %s', (offset, start, length, result) => {
    expect(offsetOf(offset, start, length)).toBeCloseTo(result);
  });
});
