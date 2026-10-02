import { describe, expect, it } from 'vitest';
import { isStartOfDay, refetchDelayOf } from './start-refetch';

describe('refetchDelayOf', () => {
  const now = new Date('2027-01-19T18:50:00Z');

  it.each([
    { label: 'nothing will reshape the board', reshapeAt: null, expected: null },
    {
      label: 'the next entry goes live in forty minutes',
      reshapeAt: '2027-01-19T19:30:00Z',
      expected: 2_401_000,
    },
    {
      label: 'midnight is twelve hours away',
      reshapeAt: '2027-01-20T06:50:00Z',
      expected: 43_201_000,
    },
    {
      label: 'the reshape lies beyond twelve hours',
      reshapeAt: '2027-01-20T06:50:00.001Z',
      expected: null,
    },
    { label: 'the reshape is now', reshapeAt: '2027-01-19T18:50:00Z', expected: null },
    { label: 'the reshape has passed', reshapeAt: '2027-01-19T18:00:00Z', expected: null },
    {
      label: 'the reshape carries an offset',
      reshapeAt: '2027-01-19T20:30:00+01:00',
      expected: 2_401_000,
    },
  ])('waits $expected ms when $label', ({ reshapeAt, expected }) => {
    expect(refetchDelayOf(reshapeAt, now)).toBe(expected);
  });
});

describe('isStartOfDay', () => {
  const now = new Date(2027, 0, 19, 8, 0);

  it.each([
    {
      label: 'the cache was built today',
      today: '2027-01-19',
      asOf: new Date(2027, 0, 19, 7, 0).toISOString(),
      expected: true,
    },
    {
      label: 'the cache was built yesterday',
      today: '2027-01-18',
      asOf: new Date(2027, 0, 18, 22, 0).toISOString(),
      expected: false,
    },
    {
      label: 'the club day differs but the device fetched it today',
      today: '2027-01-20',
      asOf: new Date(2027, 0, 19, 7, 30).toISOString(),
      expected: true,
    },
    {
      label: 'the club day matches a cache fetched before midnight',
      today: '2027-01-19',
      asOf: new Date(2027, 0, 18, 23, 59).toISOString(),
      expected: true,
    },
  ])('is $expected when $label', ({ today, asOf, expected }) => {
    expect(isStartOfDay({ today, asOf }, now)).toBe(expected);
  });
});
