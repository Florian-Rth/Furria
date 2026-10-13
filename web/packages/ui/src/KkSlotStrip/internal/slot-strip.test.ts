import { describe, expect, it } from 'vitest';
import type { KkSlotKind } from './slot-strip';
import { slotStripOf } from './slot-strip';

describe('slotStripOf', () => {
  it.each<{
    label: string;
    counts: [number, number, number];
    cap: number;
    kinds: KkSlotKind[];
    overflow: number;
  }>([
    {
      label: 'lines running work up before retries and waiting items',
      counts: [1, 1, 2],
      cap: 24,
      kinds: ['running', 'retrying', 'queued', 'queued'],
      overflow: 0,
    },
    {
      label: 'cuts the strip at the cap and counts what no longer fits',
      counts: [2, 0, 5],
      cap: 4,
      kinds: ['running', 'running', 'queued', 'queued'],
      overflow: 3,
    },
    {
      label: 'stays empty when nothing waits',
      counts: [0, 0, 0],
      cap: 24,
      kinds: [],
      overflow: 0,
    },
  ])('$label', ({ counts, cap, kinds, overflow }) => {
    const strip = slotStripOf(counts[0], counts[1], counts[2], cap);

    expect(strip.cells.map((cell) => cell.kind)).toEqual(kinds);
    expect(strip.overflow).toBe(overflow);
  });
});
