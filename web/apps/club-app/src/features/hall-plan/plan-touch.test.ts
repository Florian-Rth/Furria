import { describe, expect, it } from 'vitest';
import {
  actionBarAnchorOf,
  actionBarWidthOf,
  dragIntentOf,
  hasSideSheet,
  isBeyondSlop,
  isDoubleTap,
  isLiftableHandle,
  isTouchPlanMode,
  liftedPoint,
  longPressIntentOf,
  revealPanOf,
  screenRectOf,
  touchTargetOf,
  visibleRectOf,
} from './plan-touch';

describe('isTouchPlanMode', () => {
  it.each([
    [true, 1440, true],
    [false, 1440, false],
    [false, 1023, true],
    [false, 1024, false],
  ])('coarse %s at %i px → %s', (coarse, width, expected) => {
    expect(isTouchPlanMode(coarse, width)).toBe(expected);
  });
});

describe('hasSideSheet', () => {
  it.each([
    [899, false],
    [900, true],
  ])('%i px → %s', (width, expected) => {
    expect(hasSideSheet(width)).toBe(expected);
  });
});

describe('isBeyondSlop', () => {
  it.each([
    [{ x: 5, y: 5 }, false],
    [{ x: 9, y: 0 }, true],
  ])('to %o → %s', (to, expected) => {
    expect(isBeyondSlop({ x: 0, y: 0 }, to)).toBe(expected);
  });
});

describe('dragIntentOf', () => {
  it.each([
    ['selected', 'move'],
    ['handle', 'move'],
    ['unselected', 'pan'],
    ['empty', 'pan'],
  ] as const)('%s → %s', (target, expected) => {
    expect(dragIntentOf(target)).toBe(expected);
  });
});

describe('longPressIntentOf', () => {
  it.each([
    ['empty', 'marquee'],
    ['selected', 'toggle'],
    ['unselected', 'toggle'],
    ['handle', null],
  ] as const)('%s → %s', (target, expected) => {
    expect(longPressIntentOf(target)).toBe(expected);
  });
});

describe('isDoubleTap', () => {
  it.each([
    [null, { at: { x: 0, y: 0 }, time: 100 }, false],
    [{ at: { x: 0, y: 0 }, time: 0 }, { at: { x: 10, y: 10 }, time: 250 }, true],
    [{ at: { x: 0, y: 0 }, time: 0 }, { at: { x: 10, y: 10 }, time: 400 }, false],
    [{ at: { x: 0, y: 0 }, time: 0 }, { at: { x: 40, y: 0 }, time: 100 }, false],
  ])('%o then %o → %s', (previous, tap, expected) => {
    expect(isDoubleTap(previous, tap)).toBe(expected);
  });
});

describe('isLiftableHandle', () => {
  it.each([
    [null, false],
    ['rotate', false],
    ['nw', true],
    ['vertex:2', true],
  ])('%s → %s', (handle, expected) => {
    expect(isLiftableHandle(handle)).toBe(expected);
  });
});

describe('liftedPoint', () => {
  it('lifts the point by 48 screen px in plan units', () => {
    expect(liftedPoint({ x: 100, y: 500 }, 0.5)).toEqual({ x: 100, y: 404 });
  });
});

describe('screenRectOf', () => {
  it('maps plan bounds to viewport pixels', () => {
    expect(
      screenRectOf(
        { minX: 0, minY: 0, maxX: 200, maxY: 100 },
        { centerX: 100, centerY: 50, scale: 0.5 },
        { width: 400, height: 300 },
      ),
    ).toEqual({ minX: 150, minY: 125, maxX: 250, maxY: 175 });
  });
});

describe('actionBarAnchorOf', () => {
  const size = { width: 400, height: 800 };

  it.each([
    [
      { minX: 150, minY: 300, maxX: 250, maxY: 340 },
      { x: 200, y: 268, placement: 'above' },
    ],
    [
      { minX: 150, minY: 20, maxX: 250, maxY: 60 },
      { x: 200, y: 132, placement: 'below' },
    ],
    [
      { minX: 0, minY: 300, maxX: 20, maxY: 340 },
      { x: 108, y: 268, placement: 'above' },
    ],
    [
      { minX: 380, minY: 300, maxX: 420, maxY: 340 },
      { x: 292, y: 268, placement: 'above' },
    ],
  ])('%o → %o', (rect, expected) => {
    expect(actionBarAnchorOf(rect, size, 200)).toEqual(expected);
  });

  it('keeps a bar below a tall selection inside the viewport', () => {
    expect(actionBarAnchorOf({ minX: 100, minY: 10, maxX: 300, maxY: 790 }, size, 200)).toEqual({
      x: 200,
      y: 740,
      placement: 'below',
    });
  });
});

describe('actionBarWidthOf', () => {
  it('adds buttons, readouts and padding', () => {
    expect(actionBarWidthOf(6, 1)).toBe(330);
  });
});

describe('visibleRectOf', () => {
  it.each([
    ['none', { minX: 0, minY: 0, maxX: 400, maxY: 800 }],
    ['bottom', { minX: 0, minY: 0, maxX: 400, maxY: 360 }],
    ['side', { minX: 0, minY: 0, maxX: 48, maxY: 800 }],
  ] as const)('%s → %o', (cover, expected) => {
    expect(visibleRectOf({ width: 400, height: 800 }, cover)).toEqual(expected);
  });
});

describe('revealPanOf', () => {
  const visible = { minX: 0, minY: 0, maxX: 400, maxY: 360 };

  it.each([
    [
      { minX: 100, minY: 100, maxX: 200, maxY: 200 },
      { x: 0, y: 0 },
    ],
    [
      { minX: 100, minY: 500, maxX: 200, maxY: 600 },
      { x: 0, y: -264 },
    ],
    [
      { minX: -50, minY: 100, maxX: 50, maxY: 200 },
      { x: 74, y: 0 },
    ],
    [
      { minX: 100, minY: 0, maxX: 200, maxY: 900 },
      { x: 0, y: 24 },
    ],
  ])('%o → %o', (rect, expected) => {
    expect(revealPanOf(rect, visible)).toEqual(expected);
  });
});

describe('touchTargetOf', () => {
  const isSelected = (id: string): boolean => id === 'a';

  it.each([
    ['nw', 'a', { kind: 'handle', id: null }],
    [null, null, { kind: 'empty', id: null }],
    [null, 'a', { kind: 'selected', id: 'a' }],
    [null, 'b', { kind: 'unselected', id: 'b' }],
  ])('handle %s, hit %s → %o', (handle, hit, expected) => {
    expect(touchTargetOf(handle, hit, isSelected)).toEqual(expected);
  });
});
