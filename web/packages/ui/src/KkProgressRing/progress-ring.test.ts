import { describe, expect, it } from 'vitest';
import { ringSegmentsOf } from './progress-ring';

describe('ringSegmentsOf', () => {
  it('draws nothing without parts', () => {
    expect(ringSegmentsOf([{ state: 'done', count: 0 }], 2)).toEqual([]);
  });

  it('closes a single part without a gap', () => {
    expect(ringSegmentsOf([{ state: 'done', count: 3 }], 2)).toEqual([
      { state: 'done', dash: '100 0', offset: -0 },
    ]);
  });

  it('shares the ring by count and leaves waiting parts as track', () => {
    expect(
      ringSegmentsOf(
        [
          { state: 'done', count: 2 },
          { state: 'overdue', count: 1 },
          { state: 'waiting', count: 1 },
        ],
        2,
      ),
    ).toEqual([
      { state: 'done', dash: '48 52', offset: -1 },
      { state: 'overdue', dash: '23 77', offset: -51 },
    ]);
  });
});
