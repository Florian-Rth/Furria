import { describe, expect, it } from 'vitest';
import type { PhotoStepDirection } from './photo-viewer-steps';
import {
  canStepPhoto,
  clampPhotoIndex,
  resolveArrowStep,
  resolveSwipeStep,
  SWIPE_DISTANCE_THRESHOLD,
} from './photo-viewer-steps';

describe('clampPhotoIndex', () => {
  it.each([
    [3, 3],
    [-4, 0],
    [40, 11],
  ])('clamps the index %i into a 12-photo Album: %i', (index, clamped) => {
    expect(clampPhotoIndex(index, 12)).toBe(clamped);
  });
});

describe('canStepPhoto', () => {
  it.each<[number, PhotoStepDirection, number, boolean]>([
    [5, -1, 12, true],
    [5, 1, 12, true],
    [0, -1, 12, false],
    [11, 1, 12, false],
    [0, 1, 1, false],
  ])('from %i in direction %i of %i photos: %s', (index, direction, photoCount, can) => {
    expect(canStepPhoto(index, direction, photoCount)).toBe(can);
  });
});

describe('resolveSwipeStep', () => {
  it.each([
    [-SWIPE_DISTANCE_THRESHOLD, 1],
    [SWIPE_DISTANCE_THRESHOLD, -1],
    [SWIPE_DISTANCE_THRESHOLD - 1, null],
    [-(SWIPE_DISTANCE_THRESHOLD - 1), null],
  ])('reads a drag of %ipx as the step %s', (offsetX, step) => {
    expect(resolveSwipeStep(offsetX)).toBe(step);
  });
});

describe('resolveArrowStep', () => {
  it.each([
    ['ArrowLeft', -1],
    ['ArrowRight', 1],
    ['ArrowUp', null],
  ])('reads the key %s as the step %s', (key, step) => {
    expect(resolveArrowStep(key)).toBe(step);
  });
});
