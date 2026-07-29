import { describe, expect, it } from 'vitest';
import {
  canStepPhoto,
  clampPhotoIndex,
  resolveArrowStep,
  resolveSwipeStep,
  SWIPE_DISTANCE_THRESHOLD,
  stepPhotoIndex,
} from './photo-viewer-steps';

describe('clampPhotoIndex', () => {
  it('keeps an index inside the Album', () => {
    expect(clampPhotoIndex(3, 12)).toBe(3);
  });

  it('clamps below the first photo', () => {
    expect(clampPhotoIndex(-4, 12)).toBe(0);
  });

  it('clamps beyond the last photo', () => {
    expect(clampPhotoIndex(40, 12)).toBe(11);
  });
});

describe('stepPhotoIndex', () => {
  it('steps forward and backward', () => {
    expect(stepPhotoIndex(5, 1, 12)).toBe(6);
    expect(stepPhotoIndex(5, -1, 12)).toBe(4);
  });

  it('stays on the first photo instead of wrapping to the last', () => {
    expect(stepPhotoIndex(0, -1, 12)).toBe(0);
  });

  it('stays on the last photo instead of wrapping to the first', () => {
    expect(stepPhotoIndex(11, 1, 12)).toBe(11);
  });

  it('cannot move at all in a single-photo Album', () => {
    expect(stepPhotoIndex(0, 1, 1)).toBe(0);
    expect(stepPhotoIndex(0, -1, 1)).toBe(0);
  });
});

describe('canStepPhoto', () => {
  it('allows stepping in the middle of the Album', () => {
    expect(canStepPhoto(5, -1, 12)).toBe(true);
    expect(canStepPhoto(5, 1, 12)).toBe(true);
  });

  it('refuses stepping past either end', () => {
    expect(canStepPhoto(0, -1, 12)).toBe(false);
    expect(canStepPhoto(11, 1, 12)).toBe(false);
  });
});

describe('resolveSwipeStep', () => {
  it('reads a long drag to the left as the next photo', () => {
    expect(resolveSwipeStep(-SWIPE_DISTANCE_THRESHOLD)).toBe(1);
  });

  it('reads a long drag to the right as the previous photo', () => {
    expect(resolveSwipeStep(SWIPE_DISTANCE_THRESHOLD)).toBe(-1);
  });

  it('ignores a drag that stays under the distance threshold', () => {
    expect(resolveSwipeStep(SWIPE_DISTANCE_THRESHOLD - 1)).toBeNull();
    expect(resolveSwipeStep(-(SWIPE_DISTANCE_THRESHOLD - 1))).toBeNull();
    expect(resolveSwipeStep(0)).toBeNull();
  });
});

describe('resolveArrowStep', () => {
  it('maps the arrow keys to a direction', () => {
    expect(resolveArrowStep('ArrowLeft')).toBe(-1);
    expect(resolveArrowStep('ArrowRight')).toBe(1);
  });

  it('ignores every other key', () => {
    expect(resolveArrowStep('ArrowUp')).toBeNull();
    expect(resolveArrowStep('Enter')).toBeNull();
    expect(resolveArrowStep(' ')).toBeNull();
  });
});
