import { describe, expect, it } from 'vitest';
import {
  toScheduleDayLabel,
  toScheduleDayOptions,
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
