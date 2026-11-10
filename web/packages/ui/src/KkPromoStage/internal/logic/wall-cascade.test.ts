import { describe, expect, it } from 'vitest';
import { wallDelaysOf, wallScaleOf } from './wall-cascade';

describe('wallDelaysOf', () => {
  it('cascades the known names first and lands the fresh ones after a pause', () => {
    const delays = wallDelaysOf(
      [{ fresh: false }, { fresh: true }, { fresh: false }, { fresh: true }],
      1,
    );

    expect(delays.map((delay) => Math.round(delay * 100) / 100)).toEqual([1, 1.62, 1.06, 1.97]);
  });

  it('squeezes long lists into the same cascade time', () => {
    const delays = wallDelaysOf(
      Array.from({ length: 180 }, () => ({ fresh: false })),
      0,
    );

    expect(Math.round((delays.at(-1) ?? 0) * 100) / 100).toBe(1.79);
  });
});

describe('wallScaleOf', () => {
  it.each([
    { room: 300, content: 200, expected: 1 },
    { room: 300, content: 600, expected: 0.5 },
    { room: 300, content: 0, expected: 1 },
  ])('fits $content into $room as $expected', ({ room, content, expected }) => {
    expect(wallScaleOf(room, content)).toBe(expected);
  });
});
