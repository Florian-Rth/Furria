import { describe, expect, it } from 'vitest';
import { dayMarkOf, toEntryDays } from './calendar-board';

const at = (day: number, hour: number, month = 10, year = 2026): string =>
  new Date(year, month - 1, day, hour).toISOString();

describe('toEntryDays', () => {
  it.each([
    ['an open end', null, '2026-10-13'],
    ['an end that evening', at(13, 23), '2026-10-13'],
    ['an end in the small hours', at(14, 3), '2026-10-13'],
    ['an end on a later day', at(15, 18), '2026-10-15'],
  ])('ends an entry with %s on the right day', (_case, endsAt, endDay) => {
    expect(toEntryDays({ startsAt: at(13, 19), endsAt })).toEqual({
      startDay: '2026-10-13',
      endDay,
    });
  });
});

describe('dayMarkOf', () => {
  it.each([
    [new Date(2026, 10, 11), 'opening'],
    [new Date(2027, 1, 4), 'womensCarnivalDay'],
    [new Date(2027, 1, 6), 'carnivalWeek'],
    [new Date(2027, 1, 8), 'roseMonday'],
    [new Date(2027, 1, 9), 'carnivalTuesday'],
    [new Date(2027, 1, 10), 'ashWednesday'],
  ])('marks %s as %s', (day, key) => {
    expect(dayMarkOf(day)?.key).toBe(key);
  });

  it('leaves an ordinary day unmarked', () => {
    expect(dayMarkOf(new Date(2027, 1, 11))).toBeNull();
  });
});
