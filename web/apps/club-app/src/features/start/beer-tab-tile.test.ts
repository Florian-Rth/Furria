import { describe, expect, it } from 'vitest';
import { isBeerTabDue } from './beer-tab-tile';
import type { StartBeerTab } from './schemas';

const NOW = new Date('2026-11-04T12:00:00Z');

describe('isBeerTabDue', () => {
  it.each([
    [['2026-10-28T12:00:00Z'], true],
    [['2026-10-28T12:00:01Z'], false],
  ])('is due once an oldest open crate of %j is a week old', (bookedAts, expected) => {
    const tabs: StartBeerTab[] = bookedAts.map((oldestOpenBookedAt, index) => ({
      beerPotId: index + 1,
      openCrates: 1,
      openCents: 1500,
      oldestOpenBookedAt,
      owner: null,
      paymentLink: null,
    }));

    expect(isBeerTabDue(tabs, NOW)).toBe(expected);
  });
});
