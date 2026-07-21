import { describe, expect, it } from 'vitest';
import { computeOverflowEdges } from './use-overflow-edges';

describe('computeOverflowEdges', () => {
  it('reports no edges when everything fits', () => {
    expect(computeOverflowEdges(0, 400, 400)).toEqual({ start: false, end: false });
  });

  it('reports only the end edge at the start of an overflowing row', () => {
    expect(computeOverflowEdges(0, 400, 800)).toEqual({ start: false, end: true });
  });

  it('reports both edges mid-scroll', () => {
    expect(computeOverflowEdges(200, 400, 800)).toEqual({ start: true, end: true });
  });

  it('reports only the start edge when scrolled to the end', () => {
    expect(computeOverflowEdges(400, 400, 800)).toEqual({ start: true, end: false });
  });

  it('tolerates sub-pixel rounding at the end position', () => {
    expect(computeOverflowEdges(399.6, 400, 800)).toEqual({ start: true, end: false });
  });
});
