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
  formatWeekdayLong,
  parseBerlinDateTime,
} from './date';

describe('formatLongDate', () => {
  it('spells the month out in German', () => {
    expect(formatLongDate('2026-07-18')).toBe('18. Juli 2026');
  });

  it('drops the leading zero of the day', () => {
    expect(formatLongDate('2026-06-04')).toBe('4. Juni 2026');
  });

  it('uses the German month name for März', () => {
    expect(formatLongDate('2026-03-01')).toBe('1. März 2026');
  });
});

describe('formatShortDate', () => {
  it('renders zero-padded day and month with a trailing dot', () => {
    expect(formatShortDate('2026-07-18')).toBe('18.07.');
  });

  it('pads single-digit days', () => {
    expect(formatShortDate('2026-06-04')).toBe('04.06.');
  });

  it('stays on the club time zone for a New Year date', () => {
    expect(formatShortDate('2027-01-01')).toBe('01.01.');
  });
});

describe('formatNumericDate', () => {
  it('renders zero-padded day, month and full year', () => {
    expect(formatNumericDate('2027-01-10')).toBe('10.01.2027');
  });

  it('pads single-digit days', () => {
    expect(formatNumericDate('2026-06-04')).toBe('04.06.2026');
  });
});

describe('formatDayOfMonth', () => {
  it('keeps the zero-padded day', () => {
    expect(formatDayOfMonth('2027-02-04T18:30')).toBe('04');
  });

  it('renders two-digit days as they are', () => {
    expect(formatDayOfMonth('2027-01-23T19:11')).toBe('23');
  });
});

describe('formatMonthAbbreviation', () => {
  it('renders the uppercased German three-letter month', () => {
    expect(formatMonthAbbreviation('2027-01-23T19:11')).toBe('JAN');
  });

  it('keeps the umlaut for März', () => {
    expect(formatMonthAbbreviation('2026-03-01')).toBe('MÄR');
  });

  it('trims longer German abbreviations to three letters', () => {
    expect(formatMonthAbbreviation('2026-09-15')).toBe('SEP');
  });
});

describe('formatClockTime', () => {
  it('renders zero-padded 24h clock time', () => {
    expect(formatClockTime('2026-06-04T09:05')).toBe('09:05');
  });

  it('renders evening times unchanged', () => {
    expect(formatClockTime('2027-01-23T19:11')).toBe('19:11');
  });
});

describe('formatWeekdayLong', () => {
  it('names the German weekday', () => {
    expect(formatWeekdayLong('2027-01-23T19:11')).toBe('Samstag');
  });

  it('names a midweek day', () => {
    expect(formatWeekdayLong('2027-02-04T18:30')).toBe('Donnerstag');
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
  it('stamps winter wall-clock times with the CET offset', () => {
    expect(formatBerlinIsoWithOffset('2027-01-23T19:11')).toBe('2027-01-23T19:11:00+01:00');
  });

  it('stamps summer wall-clock times with the CEST offset', () => {
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
