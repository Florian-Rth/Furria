import { describe, expect, it } from 'vitest';
import { buildTimeChoices, parseClockTime, toClockTime } from './time-field';

describe('parseClockTime', () => {
  it('reads a clock time as hours and minutes', () => {
    const parsed = parseClockTime('20:11');

    expect([parsed?.getHours(), parsed?.getMinutes()]).toEqual([20, 11]);
  });

  it.each(['', '24:00', '9:30', 'abends'])('returns null for %j', (value) => {
    expect(parseClockTime(value)).toBeNull();
  });
});

describe('toClockTime', () => {
  it.each([
    { value: new Date(2026, 10, 11, 9, 5), expected: '09:05' },
    { value: null, expected: null },
    { value: new Date(Number.NaN), expected: null },
  ])('writes $value as $expected', ({ value, expected }) => {
    expect(toClockTime(value)).toBe(expected);
  });
});

describe('buildTimeChoices', () => {
  it.each([
    {
      quickTimes: ['20:11', '20:11', '25:00'],
      emptyLabel: 'e',
      expected: [
        { id: '', label: 'e' },
        { id: '20:11', label: '20:11' },
      ],
    },
    {
      quickTimes: ['14:11'],
      emptyLabel: null,
      expected: [{ id: '14:11', label: '14:11' }],
    },
  ])('offers $expected', ({ quickTimes, emptyLabel, expected }) => {
    expect(buildTimeChoices(quickTimes, emptyLabel)).toEqual(expected);
  });
});
