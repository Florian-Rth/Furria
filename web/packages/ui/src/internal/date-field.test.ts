import { describe, expect, it } from 'vitest';
import {
  buildDateChoices,
  parseIsoDate,
  readDateChange,
  resolveDateChoiceId,
  toIsoDate,
} from './date-field';

describe('parseIsoDate', () => {
  it('reads an ISO day as a local day', () => {
    const parsed = parseIsoDate('2025-09-01');

    expect(parsed?.getFullYear()).toBe(2025);
    expect(parsed?.getMonth()).toBe(8);
    expect(parsed?.getDate()).toBe(1);
  });

  it.each([
    ['an absent value', null],
    ['an empty string', ''],
    ['an unparseable string', 'gestern'],
    ['an impossible day', '2025-02-31'],
  ])('returns null for %s', (_case, value) => {
    expect(parseIsoDate(value)).toBeNull();
  });
});

describe('toIsoDate', () => {
  it.each([
    [new Date(2025, 8, 1), '2025-09-01'],
    [new Date(2026, 0, 7), '2026-01-07'],
    [new Date(2017, 11, 31), '2017-12-31'],
  ])('writes %s as an ISO day', (value, expected) => {
    expect(toIsoDate(value)).toBe(expected);
  });

  it('returns null for an absent date', () => {
    expect(toIsoDate(null)).toBeNull();
  });

  it('returns null for an invalid date', () => {
    expect(toIsoDate(new Date(Number.NaN))).toBeNull();
  });

  it('round-trips an ISO day through the picker value', () => {
    expect(toIsoDate(parseIsoDate('2018-03-04'))).toBe('2018-03-04');
  });
});

describe('buildDateChoices', () => {
  it('puts the empty choice first', () => {
    const choices = buildDateChoices([{ label: 'Heute', value: '2026-09-11' }], 'offen lassen');

    expect(choices.map((choice) => choice.id)).toEqual(['', '2026-09-11']);
  });

  it('omits the empty choice when it is not allowed', () => {
    const choices = buildDateChoices([{ label: 'Heute', value: '2026-09-11' }], null);

    expect(choices).toEqual([{ id: '2026-09-11', label: 'Heute' }]);
  });

  it('maps a quick choice without a date onto the empty id', () => {
    const choices = buildDateChoices([{ label: 'offen', value: null }], null);

    expect(choices).toEqual([{ id: '', label: 'offen' }]);
  });

  it('keeps the first label when the empty id occurs twice', () => {
    const choices = buildDateChoices([{ label: 'offen', value: null }], 'offen lassen');

    expect(choices).toEqual([{ id: '', label: 'offen lassen' }]);
  });

  it('keeps the first label when a day occurs twice', () => {
    const choices = buildDateChoices(
      [
        { label: 'Heute', value: '2026-09-11' },
        { label: 'Saisonstart', value: '2026-09-11' },
      ],
      null,
    );

    expect(choices).toEqual([{ id: '2026-09-11', label: 'Heute' }]);
  });
});

describe('resolveDateChoiceId', () => {
  it('reads the empty id as no date', () => {
    expect(resolveDateChoiceId('')).toBeNull();
  });

  it('passes an ISO day through', () => {
    expect(resolveDateChoiceId('2025-09-01')).toBe('2025-09-01');
  });
});

describe('readDateChange', () => {
  it('publishes a complete day', () => {
    expect(readDateChange(new Date(2025, 8, 1), false)).toEqual({
      isPublishable: true,
      value: '2025-09-01',
    });
  });

  it('swallows a half-typed day so the held value survives the keystroke', () => {
    expect(readDateChange(new Date(Number.NaN), true)).toEqual({
      isPublishable: false,
      value: null,
    });
  });

  it('publishes an emptied field when an empty value is allowed', () => {
    expect(readDateChange(null, true)).toEqual({ isPublishable: true, value: null });
  });

  it('refuses to empty a field that may not be empty', () => {
    expect(readDateChange(null, false)).toEqual({ isPublishable: false, value: null });
  });
});
