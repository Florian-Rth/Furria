import { describe, expect, it } from 'vitest';
import { startSeasonAt } from './start-season';

describe('startSeasonAt', () => {
  it.each([
    ['2026-07-20T12:00:00', 'offSeason'],
    ['2026-09-18T12:00:00', 'runUp'],
    ['2026-10-20T12:00:00', 'runUp'],
    ['2026-11-11T11:10:00', 'runUp'],
    ['2026-11-11T11:11:00', 'opening'],
    ['2026-11-11T23:00:00', 'opening'],
    ['2026-11-12T09:00:00', 'hall'],
    ['2027-01-15T12:00:00', 'hall'],
    ['2027-02-03T23:59:00', 'hall'],
    ['2027-02-04T08:00:00', 'hotDays'],
    ['2027-02-08T12:00:00', 'hotDays'],
    ['2027-02-09T22:00:00', 'hotDays'],
    ['2027-02-10T12:00:00', 'ashWednesday'],
    ['2027-02-11T12:00:00', 'offSeason'],
  ])('at %s prints the %s poster', (at, phase) => {
    expect(startSeasonAt(new Date(at)).phase).toBe(phase);
  });

  it.each([
    ['2026-09-16T12:00:00', 0],
    ['2026-09-17T12:00:00', 0],
    ['2026-10-17T12:00:00', 0.5455],
    ['2026-11-11T08:00:00', 1],
    ['2026-11-11T12:00:00', 0],
  ])('at %s the run-up share is %d', (at, share) => {
    expect(startSeasonAt(new Date(at)).runUp).toBeCloseTo(share, 3);
  });

  it.each([
    ['2026-10-20T04:59:00', true],
    ['2026-10-20T05:00:00', false],
    ['2026-10-20T17:59:00', false],
    ['2026-10-20T18:00:00', true],
  ])('at %s the evening ink is %s', (at, evening) => {
    expect(startSeasonAt(new Date(at)).evening).toBe(evening);
  });
});
