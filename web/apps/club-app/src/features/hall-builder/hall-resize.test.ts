import { describe, expect, it } from 'vitest';
import { isResizeHandle, resizeRect } from './hall-resize';

describe('resizeRect', () => {
  it.each([
    {
      handle: 'e' as const,
      at: { x: 150, y: 0 },
      center: { x: 25, y: 0 },
      width: 250,
      height: 100,
    },
    {
      handle: 'nw' as const,
      at: { x: -150, y: -100 },
      center: { x: -25, y: -25 },
      width: 250,
      height: 150,
    },
    { handle: 'w' as const, at: { x: 500, y: 0 }, center: { x: 95, y: 0 }, width: 10, height: 100 },
  ])('drags $handle to $at', ({ handle, at, center, width, height }) => {
    const rect = resizeRect(
      { center: { x: 0, y: 0 }, width: 200, height: 100, rotation: 0 },
      handle,
      at,
      10,
    );

    expect(rect.center.x).toBeCloseTo(center.x);
    expect(rect.center.y).toBeCloseTo(center.y);
    expect(rect.width).toBeCloseTo(width);
    expect(rect.height).toBeCloseTo(height);
  });

  it('works in the rotated frame', () => {
    const rect = resizeRect(
      { center: { x: 0, y: 0 }, width: 200, height: 100, rotation: 90 },
      's',
      { x: -100, y: 0 },
      10,
    );

    expect(rect.height).toBeCloseTo(150);
    expect(rect.center.x).toBeCloseTo(-25);
  });
});

describe('isResizeHandle', () => {
  it.each([
    { value: 'se', expected: true },
    { value: 'rotate', expected: false },
    { value: null, expected: false },
  ])('$value', ({ value, expected }) => {
    expect(isResizeHandle(value)).toBe(expected);
  });
});
