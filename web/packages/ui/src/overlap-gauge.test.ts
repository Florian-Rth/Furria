import { describe, expect, it } from 'vitest';
import { gaugeSegmentsOf } from './overlap-gauge';

describe('gaugeSegmentsOf', () => {
  it('draws nothing without people', () => {
    expect(gaugeSegmentsOf(0, 0, 4)).toEqual([]);
  });

  it('draws one segment per person and fills the shared ones first', () => {
    expect(gaugeSegmentsOf(1, 4, 4)).toEqual([
      { key: 'p0', filled: true, dash: '21 79', offset: -2 },
      { key: 'p1', filled: false, dash: '21 79', offset: -27 },
      { key: 'p2', filled: false, dash: '21 79', offset: -52 },
      { key: 'p3', filled: false, dash: '21 79', offset: -77 },
    ]);
  });

  it('closes the ring for a single person', () => {
    expect(gaugeSegmentsOf(1, 1, 4)).toEqual([
      { key: 'p0', filled: true, dash: '100 0', offset: -0 },
    ]);
  });

  it('draws two arcs for a big cast', () => {
    expect(gaugeSegmentsOf(5, 20, 4)).toEqual([
      { key: 'shared', filled: true, dash: '21 79', offset: -2 },
      { key: 'rest', filled: false, dash: '71 29', offset: -27 },
    ]);
  });

  it('caps the shared count at the cast', () => {
    expect(gaugeSegmentsOf(30, 20, 4)).toEqual([
      { key: 'shared', filled: true, dash: '100 0', offset: -0 },
    ]);
  });
});
