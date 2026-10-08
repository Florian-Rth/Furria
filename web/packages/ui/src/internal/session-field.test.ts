import { describe, expect, it } from 'vitest';
import { buildSessionChoices, formatSessionYear, readSessionInput } from './session-field';

describe('formatSessionYear', () => {
  it.each([
    [2009, '2009/10'],
    [1999, '1999/00'],
  ])('renders %i as the Session %s', (year, expected) => {
    expect(formatSessionYear(year)).toBe(expected);
  });
});

describe('buildSessionChoices', () => {
  it.each([
    { openLabel: null, ids: ['2025', '2026'] },
    { openLabel: 'open', ids: ['', '2025', '2026'] },
  ])('offers this Session and the next one with open label $openLabel', ({ openLabel, ids }) => {
    expect(buildSessionChoices(2025, openLabel).map((choice) => choice.id)).toEqual(ids);
  });
});

describe('readSessionInput', () => {
  it.each([
    { text: '  2025  ', allowOpen: false, isPublishable: true, year: 2025 },
    { text: '   ', allowOpen: true, isPublishable: true, year: null },
    { text: '', allowOpen: false, isPublishable: false, year: null },
    { text: '20x5', allowOpen: true, isPublishable: false, year: null },
    { text: '20255', allowOpen: true, isPublishable: false, year: null },
  ])(
    'reads $text with allowOpen=$allowOpen as publishable=$isPublishable year=$year',
    ({ text, allowOpen, isPublishable, year }) => {
      expect(readSessionInput(text, allowOpen)).toEqual({ isPublishable, year });
    },
  );
});
