import { describe, expect, it } from 'vitest';
import {
  gridRowsOf,
  gridSpanOf,
  mondayOfRow,
  rowOfDayIn,
  settleRowOf,
  weekSpotOf,
} from './calendar-fold';

describe('gridRowsOf', () => {
  it.each([
    ['2026-10-01', 5],
    ['2026-11-01', 6],
    ['2021-02-01', 4],
  ])('%s spans %d weeks', (month, rows) => {
    expect(gridRowsOf(month)).toBe(rows);
  });
});

describe('weekSpotOf', () => {
  it.each([
    ['2026-10-20', { month: '2026-10-01', row: 3 }],
    ['2026-10-01', { month: '2026-10-01', row: 0 }],
    ['2026-11-01', { month: '2026-10-01', row: 4 }],
    ['2026-11-02', { month: '2026-11-01', row: 1 }],
    ['2027-01-01', { month: '2026-12-01', row: 4 }],
  ])('places the week of %s', (day, spot) => {
    expect(weekSpotOf(day)).toEqual(spot);
  });
});

describe('rowOfDayIn', () => {
  it.each([
    ['2026-10-01', '2026-09-28', 0],
    ['2026-10-01', '2026-11-01', 4],
    ['2026-10-01', '2026-11-02', null],
    ['2026-10-01', '2026-09-27', null],
  ])('in %s the day %s sits on row %s', (month, day, row) => {
    expect(rowOfDayIn(month, day)).toBe(row);
  });
});

describe('settleRowOf', () => {
  it.each([
    ['2026-10-01', '2026-10-20', 3],
    ['2026-11-01', '2026-10-20', 1],
    ['2026-10-01', '2027-01-15', 0],
  ])('folds %s around %s into row %d', (month, day, row) => {
    expect(settleRowOf(month, day)).toBe(row);
  });
});

it('names the Monday of a row and the span of a month grid', () => {
  expect([mondayOfRow({ month: '2026-11-01', row: 2 }), gridSpanOf('2026-11-01')]).toEqual([
    '2026-11-09',
    { from: '2026-10-26', to: '2026-12-06' },
  ]);
});
