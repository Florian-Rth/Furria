import { describe, expect, it } from 'vitest';
import { formatPriceCents, toEventStatusVariant } from './event-copy';

describe('formatPriceCents', () => {
  it.each([
    [2_200, '22,00 €'],
    [5, '0,05 €'],
    [100_000, '1000,00 €'],
  ])('formats %i cents', (priceCents, expected) => {
    expect(formatPriceCents(priceCents)).toBe(expected);
  });
});

describe('toEventStatusVariant', () => {
  it.each([
    {
      label: 'a scheduled presale with a start',
      sales: { status: 'presaleScheduled' as const, presaleStartsAt: '2026-12-01T09:00:00Z' },
      expected: { kind: 'presaleScheduled', presaleStartsAt: '2026-12-01T09:00:00Z' },
    },
    {
      label: 'a scheduled presale without a start',
      sales: { status: 'presaleScheduled' as const, presaleStartsAt: null },
      expected: { kind: 'announced' },
    },
    {
      label: 'any other status',
      sales: { status: 'soldOut' as const, presaleStartsAt: '2026-12-01T09:00:00Z' },
      expected: { kind: 'soldOut' },
    },
  ])('reads $label as $expected.kind', ({ sales, expected }) => {
    expect(toEventStatusVariant(sales)).toEqual(expected);
  });
});
