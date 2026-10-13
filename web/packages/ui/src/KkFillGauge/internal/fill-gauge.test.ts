import { describe, expect, it } from 'vitest';
import type { FillGaugeShares } from './fill-gauge';
import { fillGaugeSharesOf } from './fill-gauge';

describe('fillGaugeSharesOf', () => {
  it.each<{
    label: string;
    parts: number[];
    free: number | null;
    total: number | null;
    shares: FillGaugeShares;
  }>([
    {
      label: 'splits a measured volume into the surveyed parts, the rest and the free space',
      parts: [400, 100],
      free: 300,
      total: 1000,
      shares: { parts: [0.4, 0.1], other: 0.2, free: 0.3, cap: 'calm' },
    },
    {
      label: 'turns gold below fifteen percent free',
      parts: [800],
      free: 100,
      total: 1000,
      shares: { parts: [0.8], other: 0.1, free: 0.1, cap: 'low' },
    },
    {
      label: 'turns red below five percent free',
      parts: [900],
      free: 40,
      total: 1000,
      shares: { parts: [0.9], other: 0.06, free: 0.04, cap: 'critical' },
    },
    {
      label: 'shrinks a survey that outgrew the used space so the bar never overflows',
      parts: [600, 600],
      free: 400,
      total: 1000,
      shares: { parts: [0.3, 0.3], other: 0, free: 0.4, cap: 'calm' },
    },
    {
      label: 'shows the survey on its own when the volume could not be read',
      parts: [300, 100],
      free: null,
      total: null,
      shares: { parts: [0.75, 0.25], other: 0, free: 0, cap: 'calm' },
    },
    {
      label: 'stays empty when nothing was surveyed and no volume is known',
      parts: [0, 0],
      free: null,
      total: null,
      shares: { parts: [0, 0], other: 0, free: 0, cap: 'calm' },
    },
  ])('$label', ({ parts, free, total, shares }) => {
    const result = fillGaugeSharesOf(parts, free, total);

    expect(result.cap).toBe(shares.cap);
    expect(result.free).toBeCloseTo(shares.free);
    expect(result.other).toBeCloseTo(shares.other);
    result.parts.forEach((part, index) => {
      expect(part).toBeCloseTo(shares.parts[index] ?? Number.NaN);
    });
  });
});
