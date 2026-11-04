import { describe, expect, it } from 'vitest';
import type { BeerBookedCrates } from './booking-overlay';
import type { BeerBookPageReads, BeerBookPageStage } from './booking-page';
import { bookPageStageOf, isBookingDone } from './booking-page';

describe('bookPageStageOf', () => {
  it.each<[string, BeerBookPageReads, BeerBookPageStage]>([
    [
      'who she is is still loading',
      { gate: null, isAffiliated: false, loaded: false, failed: false },
      'loading',
    ],
    [
      'who she is failed to load',
      { gate: null, isAffiliated: false, loaded: false, failed: true },
      'failed',
    ],
    [
      'an affiliated person without enrollment declares first',
      { gate: 'enroll', isAffiliated: true, loaded: false, failed: false },
      'enroll',
    ],
    [
      'a former enrollee still in the club declares again',
      { gate: 'former', isAffiliated: true, loaded: true, failed: false },
      'enroll',
    ],
    [
      'an operator who is not enrolled declares to book for herself',
      { gate: 'keeper', isAffiliated: true, loaded: true, failed: false },
      'enroll',
    ],
    [
      'someone outside the club gets the explanation',
      { gate: 'enroll', isAffiliated: false, loaded: false, failed: true },
      'unaffiliated',
    ],
    [
      'an enrolled person waits for her tab and the pot',
      { gate: 'noPot', isAffiliated: true, loaded: false, failed: false },
      'loading',
    ],
    [
      'an enrolled person whose tab failed to load',
      { gate: 'open', isAffiliated: true, loaded: false, failed: true },
      'failed',
    ],
    ['no pot is open', { gate: 'noPot', isAffiliated: true, loaded: true, failed: false }, 'noPot'],
    [
      'an enrolled person with an open pot books',
      { gate: 'open', isAffiliated: true, loaded: true, failed: false },
      'book',
    ],
  ])('%s', (_label, reads, expected) => {
    expect(bookPageStageOf(reads)).toBe(expected);
  });
});

describe('isBookingDone', () => {
  const booked: BeerBookedCrates = {
    crateIds: [7],
    priceCents: 1800,
    bookedAt: '2026-11-04T20:00:00Z',
  };
  const earlier: BeerBookedCrates = {
    crateIds: [5],
    priceCents: 1800,
    bookedAt: '2026-11-04T19:00:00Z',
  };

  it.each<[string, BeerBookedCrates | null, BeerBookedCrates | null, boolean]>([
    ['nothing booked yet', null, null, false],
    ['the undo window closed', booked, null, true],
    ['she chose to book again', booked, booked, false],
    ['a newer booking lapsed after an earlier one was set aside', booked, earlier, true],
  ])('%s', (_label, lapsed, dismissed, expected) => {
    expect(isBookingDone(lapsed, dismissed)).toBe(expected);
  });
});
