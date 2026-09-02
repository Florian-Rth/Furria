import { describe, expect, it } from 'vitest';
import {
  berlinDayNumber,
  formatBerlinIsoWithOffset,
  formatClockTime,
  formatDayOfMonth,
  formatLongDate,
  formatLongDateRange,
  formatMonthAbbreviation,
  formatNumericDate,
  formatShortDate,
  formatWeekdayAndDate,
  formatWeekdayAndFullDate,
  formatWeekdayLong,
  parseBerlinDateTime,
} from './date';

type FormatterCase = [string, (isoDate: string) => string, string, string];

const FORMATTER_CASES: FormatterCase[] = [
  ['formatLongDate spells the month out', formatLongDate, '2026-07-18', '18. Juli 2026'],
  ['formatLongDate drops the leading zero', formatLongDate, '2026-06-04', '4. Juni 2026'],
  ['formatLongDate keeps the März umlaut', formatLongDate, '2026-03-01', '1. März 2026'],
  ['formatShortDate pads and trails a dot', formatShortDate, '2026-06-04', '04.06.'],
  ['formatNumericDate pads and adds the year', formatNumericDate, '2026-06-04', '04.06.2026'],
  ['formatDayOfMonth pads a single-digit day', formatDayOfMonth, '2027-02-04T18:30', '04'],
  ['formatDayOfMonth leaves a two-digit day', formatDayOfMonth, '2027-01-23T19:11', '23'],
  ['formatMonthAbbreviation upper-cases', formatMonthAbbreviation, '2027-01-23T19:11', 'JAN'],
  ['formatMonthAbbreviation keeps the umlaut', formatMonthAbbreviation, '2026-03-01', 'MÄR'],
  ['formatMonthAbbreviation trims to three', formatMonthAbbreviation, '2026-09-15', 'SEP'],
  ['formatClockTime pads the 24h clock', formatClockTime, '2026-06-04T09:05', '09:05'],
  ['formatWeekdayLong names the weekday', formatWeekdayLong, '2027-02-04T18:30', 'Donnerstag'],
  [
    'formatWeekdayAndDate abbreviates the weekday',
    formatWeekdayAndDate,
    '2027-01-23T19:11',
    'Sa., 23. Januar',
  ],
  [
    'formatWeekdayAndFullDate adds the year',
    formatWeekdayAndFullDate,
    '2027-01-23T19:11',
    'Sa., 23. Januar 2027',
  ],
];

describe('the German date formatters', () => {
  it.each(FORMATTER_CASES)('%s', (_label, format, isoDate, expected) => {
    expect(format(isoDate)).toBe(expected);
  });
});

describe('formatLongDateRange', () => {
  it('collapses a same-year range onto one year', () => {
    expect(formatLongDateRange('2027-01-23T19:11', '2027-02-07T14:11')).toBe(
      '23. Januar – 7. Februar 2027',
    );
  });

  it('spells both years for a range across New Year', () => {
    expect(formatLongDateRange('2026-11-14', '2027-02-07')).toBe(
      '14. November 2026 – 7. Februar 2027',
    );
  });
});

describe('parseBerlinDateTime', () => {
  it('resolves a winter wall-clock time to its real instant', () => {
    expect(parseBerlinDateTime('2027-01-23T19:11').toISOString()).toBe('2027-01-23T18:11:00.000Z');
  });

  it('respects summer time', () => {
    expect(parseBerlinDateTime('2026-07-01T12:00').toISOString()).toBe('2026-07-01T10:00:00.000Z');
  });

  it('anchors a date-only string at Berlin midnight', () => {
    expect(parseBerlinDateTime('2026-07-18').toISOString()).toBe('2026-07-17T22:00:00.000Z');
  });
});

describe('formatBerlinIsoWithOffset', () => {
  it('stamps wall-clock times with the CET and CEST offsets', () => {
    expect(formatBerlinIsoWithOffset('2027-01-23T19:11')).toBe('2027-01-23T19:11:00+01:00');
    expect(formatBerlinIsoWithOffset('2026-07-01T12:00')).toBe('2026-07-01T12:00:00+02:00');
  });
});

describe('berlinDayNumber', () => {
  it('keeps a late Berlin evening on its own calendar day', () => {
    expect(berlinDayNumber('2027-01-23T23:30') - berlinDayNumber('2027-01-23T00:10')).toBe(0);
  });

  it('counts calendar days between wall-clock strings', () => {
    expect(berlinDayNumber('2027-01-24T00:10') - berlinDayNumber('2027-01-23T23:30')).toBe(1);
  });

  it('places a real instant on the Berlin calendar', () => {
    expect(berlinDayNumber(new Date('2027-01-23T23:30:00Z'))).toBe(berlinDayNumber('2027-01-24'));
  });
});
