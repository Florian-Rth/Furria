import { describe, expect, it } from 'vitest';
import type { QuietMemory } from './start-quiet';
import { isQuiet, parseQuietMemory, pruneQuiet, quietAfterOpen } from './start-quiet';

const TODAY = '2027-01-19';
const ROLE_KEY = 'mine:newRole:4:2027-01-12';
const JUBILEE_KEY = 'groups:jubilee:6';

describe('parseQuietMemory', () => {
  it.each<{ label: string; raw: string | null; expected: QuietMemory }>([
    { label: 'nothing is stored', raw: null, expected: { v: 1, items: {} } },
    { label: 'the value is not JSON', raw: 'quiet', expected: { v: 1, items: {} } },
    {
      label: 'another version is stored',
      raw: `{"v":2,"items":{"${ROLE_KEY}":"2027-01-26"}}`,
      expected: { v: 1, items: {} },
    },
    {
      label: 'an item carries no day',
      raw: `{"v":1,"items":{"${ROLE_KEY}":"bald"}}`,
      expected: { v: 1, items: {} },
    },
    {
      label: 'one item has run out',
      raw: `{"v":1,"items":{"${ROLE_KEY}":"2027-01-26","${JUBILEE_KEY}":"2027-01-18"}}`,
      expected: { v: 1, items: { [ROLE_KEY]: '2027-01-26' } },
    },
    {
      label: 'an item lasts until today',
      raw: `{"v":1,"items":{"${JUBILEE_KEY}":"${TODAY}"}}`,
      expected: { v: 1, items: { [JUBILEE_KEY]: TODAY } },
    },
  ])('reads $expected when $label', ({ raw, expected }) => {
    expect(parseQuietMemory(raw, TODAY)).toEqual(expected);
  });
});

describe('pruneQuiet', () => {
  it('drops every item whose quiet ended before today', () => {
    expect(
      pruneQuiet({ v: 1, items: { [ROLE_KEY]: '2027-01-18', [JUBILEE_KEY]: '2027-01-24' } }, TODAY),
    ).toEqual({ v: 1, items: { [JUBILEE_KEY]: '2027-01-24' } });
  });
});

describe('isQuiet', () => {
  it.each<{ label: string; items: Record<string, string>; expected: boolean }>([
    { label: 'she never opened it', items: {}, expected: false },
    { label: 'the quiet lasts until today', items: { [ROLE_KEY]: TODAY }, expected: true },
    { label: 'the quiet lasts a week', items: { [ROLE_KEY]: '2027-01-26' }, expected: true },
    { label: 'the quiet ended yesterday', items: { [ROLE_KEY]: '2027-01-18' }, expected: false },
  ])('is $expected when $label', ({ items, expected }) => {
    expect(isQuiet({ v: 1, items }, ROLE_KEY, TODAY)).toBe(expected);
  });
});

describe('quietAfterOpen', () => {
  it.each<{ label: string; items: Record<string, string>; until: string; expected: string }>([
    {
      label: 'she opens it the first time',
      items: {},
      until: '2027-01-26',
      expected: '2027-01-26',
    },
    {
      label: 'an earlier quiet is stored',
      items: { [ROLE_KEY]: '2027-01-20' },
      until: '2027-01-26',
      expected: '2027-01-26',
    },
    {
      label: 'a later quiet is stored',
      items: { [ROLE_KEY]: '2027-02-02' },
      until: '2027-01-26',
      expected: '2027-02-02',
    },
  ])('quiets until $expected when $label', ({ items, until, expected }) => {
    expect(quietAfterOpen({ v: 1, items }, ROLE_KEY, until).items[ROLE_KEY]).toBe(expected);
  });

  it('leaves the other items alone', () => {
    expect(
      quietAfterOpen({ v: 1, items: { [JUBILEE_KEY]: '2027-01-24' } }, ROLE_KEY, '2027-01-26'),
    ).toEqual({ v: 1, items: { [JUBILEE_KEY]: '2027-01-24', [ROLE_KEY]: '2027-01-26' } });
  });
});
