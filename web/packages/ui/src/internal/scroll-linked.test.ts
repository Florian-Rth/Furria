import { describe, expect, it } from 'vitest';
import { scrollStopsOf } from './scroll-linked';

describe('scrollStopsOf', () => {
  it('places each scroll offset as its share of the travel', () => {
    const stops = scrollStopsOf(72, [0, 39.6, 72], (scrollOffset) => ({ opacity: scrollOffset }));

    expect(stops).toEqual({
      '0%': { opacity: 0 },
      '55%': { opacity: 39.6 },
      '100%': { opacity: 72 },
    });
  });

  it.each([
    { scrollOffset: -12, stop: '0%' },
    { scrollOffset: 144, stop: '100%' },
    { scrollOffset: 24, stop: '33.3333%' },
  ])('keeps offset $scrollOffset inside the travel as $stop', ({ scrollOffset, stop }) => {
    expect(Object.keys(scrollStopsOf(72, [scrollOffset], () => ({})))).toEqual([stop]);
  });
});
