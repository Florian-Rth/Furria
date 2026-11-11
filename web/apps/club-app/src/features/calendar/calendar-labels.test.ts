import { describe, expect, it } from 'vitest';
import {
  toAnswerShare,
  toCloserName,
  toScheduleDayLabel,
  toScheduleDayOptions,
  toSignUpListCountLabel,
  toStartDayQuickChoices,
} from './calendar-labels';

describe('toStartDayQuickChoices', () => {
  it.each([
    { today: new Date(2026, 9, 13), expected: ['2026-10-13', '2026-10-14'] },
    { today: new Date(2026, 9, 31), expected: ['2026-10-31', '2026-11-01'] },
    { today: new Date(2026, 11, 31), expected: ['2026-12-31', '2027-01-01'] },
  ])('offers today and the following day for $today', ({ today, expected }) => {
    expect(toStartDayQuickChoices(today).map((choice) => choice.value)).toEqual(expected);
  });
});

describe('toScheduleDayOptions', () => {
  it.each([
    { span: 1, held: [0], expected: ['0'] },
    { span: 3, held: [], expected: ['0', '1', '2'] },
    { span: 2, held: [4, 1, 4], expected: ['0', '1', '4'] },
  ])('offers the days of a $span-day entry keeping $held', ({ span, held, expected }) => {
    expect(toScheduleDayOptions('2026-11-20', span, held).map((option) => option.value)).toEqual(
      expected,
    );
  });
});

describe('toScheduleDayLabel', () => {
  it.each([
    { startDay: '2026-11-30', day: 1, expected: 'Dienstag, 01.12.2026' },
    { startDay: '', day: 1, expected: 'Tag 2' },
  ])('names day $day after $startDay as $expected', ({ startDay, day, expected }) => {
    expect(toScheduleDayLabel(startDay, day)).toBe(expected);
  });
});

describe('toAnswerShare', () => {
  it.each([
    { count: 2, concernedCount: 5, expected: { kind: 'share', count: 2, of: 5 } },
    { count: 0, concernedCount: 3, expected: { kind: 'share', count: 0, of: 3 } },
    { count: 2, concernedCount: null, expected: { kind: 'count', count: 2 } },
  ])('shares $count of $concernedCount', ({ count, concernedCount, expected }) => {
    expect(toAnswerShare(count, concernedCount)).toEqual(expected);
  });
});

describe('toCloserName', () => {
  it.each([
    [{ closedByFirstName: 'Ilka', closedByLastName: 'Kalender' }, 'Ilka Kalender'],
    [{ closedByFirstName: null, closedByLastName: null }, null],
    [{ closedByFirstName: 'Ilka', closedByLastName: null }, null],
  ] as const)('names the closer of %o', (closing, expected) => {
    expect(toCloserName(closing)).toBe(expected);
  });
});

describe('toSignUpListCountLabel', () => {
  it.each([
    [3, 17, '3 von 17'],
    [0, 17, '0 von 17'],
    [0, null, undefined],
  ])('%i lines of %s concerned → %s', (count, concernedCount, expected) => {
    const lines = Array.from({ length: count }, (_, index) => ({
      lineId: index + 1,
      personId: index + 1,
      firstName: 'Anna',
      lastName: 'Berg',
      text: null,
      byViewer: false,
    }));

    expect(toSignUpListCountLabel({ lines, concernedCount })).toBe(expected);
  });
});
