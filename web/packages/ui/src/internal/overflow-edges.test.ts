import { describe, expect, it } from 'vitest';
import { computeOverflowEdges } from './overflow-edges';

describe('computeOverflowEdges', () => {
  it.each([
    { scrollLeft: 0, scrollWidth: 400, start: false, end: false },
    { scrollLeft: 0, scrollWidth: 800, start: false, end: true },
    { scrollLeft: 400, scrollWidth: 800, start: true, end: false },
    { scrollLeft: 399.6, scrollWidth: 800, start: true, end: false },
  ])(
    'reads start=$start end=$end at $scrollLeft of $scrollWidth',
    ({ scrollLeft, scrollWidth, start, end }) => {
      expect(computeOverflowEdges(scrollLeft, 400, scrollWidth)).toEqual({ start, end });
    },
  );
});
