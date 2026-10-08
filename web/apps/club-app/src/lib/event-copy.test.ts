import { describe, expect, it } from 'vitest';
import { formatPriceCents, toEventStatusLabel, toEventStatusShortLabel } from './event-copy';

const at = (year: number, month: number, day: number, hour = 0, minute = 0): string =>
  new Date(year, month - 1, day, hour, minute).toISOString();

describe('formatPriceCents', () => {
  it.each([
    [2_200, '22,00 €'],
    [1_550, '15,50 €'],
    [5, '0,05 €'],
    [100_000, '1000,00 €'],
    [0, 'Eintritt frei'],
  ])('formats %i cents', (priceCents, expected) => {
    expect(formatPriceCents(priceCents)).toBe(expected);
  });
});

describe('toEventStatusLabel', () => {
  it('names the day and hour a scheduled presale starts', () => {
    expect(
      toEventStatusLabel({ status: 'presaleScheduled', presaleStartsAt: at(2026, 12, 1, 10) }),
    ).toBe('Vorverkauf startet am 01.12.2026, 10:00 Uhr');
  });

  it('reads a scheduled presale without a start as merely announced', () => {
    expect(toEventStatusLabel({ status: 'presaleScheduled', presaleStartsAt: null })).toBe(
      toEventStatusLabel({ status: 'announced', presaleStartsAt: null }),
    );
  });
});

describe('toEventStatusShortLabel', () => {
  it('shortens a scheduled presale to its day', () => {
    expect(
      toEventStatusShortLabel({ status: 'presaleScheduled', presaleStartsAt: at(2026, 12, 1, 10) }),
    ).toBe('VVK ab 01.12.');
  });
});
