import { describe, expect, it } from 'vitest';
import {
  buildSessionChoices,
  formatSessionYear,
  readSessionInput,
  resolveSessionChoiceId,
  sessionChoiceId,
  sessionYearToInput,
} from './session-field';

describe('formatSessionYear', () => {
  it.each([
    [2025, '2025/26'],
    [2009, '2009/10'],
    [1999, '1999/00'],
    [2099, '2099/00'],
  ])('renders %i as the Session %s', (year, expected) => {
    expect(formatSessionYear(year)).toBe(expected);
  });
});

describe('buildSessionChoices', () => {
  it('offers this Session and the next one', () => {
    expect(buildSessionChoices(2025, null)).toEqual([
      { id: '2025', label: '2025/26' },
      { id: '2026', label: '2026/27' },
    ]);
  });

  it('puts the open choice in front when one is allowed', () => {
    const choices = buildSessionChoices(2025, 'offen lassen');

    expect(choices.map((choice) => choice.id)).toEqual(['', '2025', '2026']);
  });
});

describe('readSessionInput', () => {
  it.each([
    ['2025', true, 2025],
    ['  2025  ', true, 2025],
    ['', true, null],
    ['   ', true, null],
    ['20', false, null],
    ['20x5', false, null],
    ['20255', false, null],
    ['1999', true, 1999],
  ])(
    'reads %j as publishable=%s year=%j when an open end is allowed',
    (text, isPublishable, year) => {
      expect(readSessionInput(text, true)).toEqual({ isPublishable, year });
    },
  );

  it('keeps an emptied field unpublished when no open end is allowed', () => {
    expect(readSessionInput('', false)).toEqual({ isPublishable: false, year: null });
  });

  it('still publishes a typed year when no open end is allowed', () => {
    expect(readSessionInput('2027', false)).toEqual({ isPublishable: true, year: 2027 });
  });
});

describe('sessionChoiceId', () => {
  it.each([
    [2025, '2025'],
    [null, ''],
  ])('writes %j as the choice id %j', (year, expected) => {
    expect(sessionChoiceId(year)).toBe(expected);
  });

  it('round-trips a year through its choice id', () => {
    expect(resolveSessionChoiceId(sessionChoiceId(2027))).toBe(2027);
  });

  it('reads the empty choice id as no Session', () => {
    expect(resolveSessionChoiceId('')).toBeNull();
  });
});

describe('sessionYearToInput', () => {
  it.each([
    [2025, '2025'],
    [null, ''],
  ])('writes %j as the input text %j', (year, expected) => {
    expect(sessionYearToInput(year)).toBe(expected);
  });
});
