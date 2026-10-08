import { describe, expect, it } from 'vitest';
import { buildDateChoices, parseIsoDate, readDateChange, toIsoDate } from './date-field';

describe('parseIsoDate', () => {
  it('reads an ISO day as a local day', () => {
    const parsed = parseIsoDate('2025-09-01');

    expect([parsed?.getFullYear(), parsed?.getMonth(), parsed?.getDate()]).toEqual([2025, 8, 1]);
  });

  it.each([null, 'gestern', '2025-02-31'])('returns null for %j', (value) => {
    expect(parseIsoDate(value)).toBeNull();
  });
});

describe('toIsoDate', () => {
  it.each([
    { value: new Date(2026, 0, 7), expected: '2026-01-07' },
    { value: null, expected: null },
    { value: new Date(Number.NaN), expected: null },
  ])('writes $value as $expected', ({ value, expected }) => {
    expect(toIsoDate(value)).toBe(expected);
  });
});

describe('buildDateChoices', () => {
  it.each([
    {
      quickChoices: [{ label: 'a', value: '2026-09-11' }],
      emptyLabel: 'e',
      expected: [
        { id: '', label: 'e' },
        { id: '2026-09-11', label: 'a' },
      ],
    },
    {
      quickChoices: [{ label: 'a', value: null }],
      emptyLabel: 'e',
      expected: [{ id: '', label: 'e' }],
    },
    {
      quickChoices: [
        { label: 'a', value: '2026-09-11' },
        { label: 'b', value: '2026-09-11' },
      ],
      emptyLabel: null,
      expected: [{ id: '2026-09-11', label: 'a' }],
    },
  ])('keeps the first choice per id', ({ quickChoices, emptyLabel, expected }) => {
    expect(buildDateChoices(quickChoices, emptyLabel)).toEqual(expected);
  });
});

describe('readDateChange', () => {
  it.each([
    { date: new Date(2025, 8, 1), allowEmpty: false, isPublishable: true, value: '2025-09-01' },
    { date: new Date(Number.NaN), allowEmpty: true, isPublishable: false, value: null },
    { date: null, allowEmpty: true, isPublishable: true, value: null },
    { date: null, allowEmpty: false, isPublishable: false, value: null },
  ])(
    'reads $date with allowEmpty=$allowEmpty as publishable=$isPublishable',
    ({ date, allowEmpty, isPublishable, value }) => {
      expect(readDateChange(date, allowEmpty)).toEqual({ isPublishable, value });
    },
  );
});
