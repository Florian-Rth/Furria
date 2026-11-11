import { describe, expect, it } from 'vitest';
import type { NameEntry } from './calendar-names';
import {
  isNameSearchable,
  toCappedList,
  toCurrentTab,
  toNameLine,
  toNameMatches,
  toOwnFirst,
  toSheetOrder,
  toSheetTabs,
} from './calendar-names';

const entry = (key: string, name: string, isOwn = false, text?: string): NameEntry =>
  text === undefined ? { key, name, isOwn } : { key, name, isOwn, text };

describe('toSheetOrder', () => {
  it('puts her own name first and sorts the rest alphabetically with umlauts in place', () => {
    const ordered = toSheetOrder([
      entry('1', 'Zora Wolf'),
      entry('2', 'Ömer Arslan'),
      entry('3', 'Lena Brandt', true),
      entry('4', 'Anna Kessler'),
    ]);

    expect(ordered.map((item) => item.key)).toEqual(['3', '4', '2', '1']);
  });
});

describe('toNameLine', () => {
  it('returns nothing for no names', () => {
    expect(toNameLine([])).toBeNull();
  });

  it('shows her as the first name and counts the remainder', () => {
    const line = toNameLine(
      [
        entry('1', 'Frank Weber'),
        entry('2', 'Anna Kessler'),
        entry('3', 'Lena Brandt', true),
        entry('4', 'Paula Richter'),
        entry('5', 'Gerd Lang'),
      ],
      3,
    );

    expect(line).toEqual({ names: 'Du, Anna Kessler, Frank Weber', more: '+2' });
  });

  it('has no remainder when every name fits', () => {
    expect(toNameLine([entry('1', 'Frank Weber'), entry('2', 'Anna Kessler')], 3)).toEqual({
      names: 'Anna Kessler, Frank Weber',
      more: undefined,
    });
  });
});

describe('toNameMatches', () => {
  const entries = [
    entry('1', 'Jana Kühn', false, 'Kuchen'),
    entry('2', 'Frank Weber', false, 'Getränke'),
    entry('3', 'Lena Brandt'),
  ];

  it.each([
    ['', ['1', '2', '3']],
    ['kuhn', ['1']],
    ['  ', ['1', '2', '3']],
    ['getranke', ['2']],
    ['lena br', ['3']],
    ['lena weber', []],
  ])('matches %j on name and text', (query, keys) => {
    expect(toNameMatches(entries, query).map((item) => item.key)).toEqual(keys);
  });
});

describe('isNameSearchable', () => {
  it.each([
    [14, false],
    [15, true],
  ])('searches %i names: %s', (count, searchable) => {
    expect(isNameSearchable(count)).toBe(searchable);
  });
});

describe('toOwnFirst', () => {
  it('moves her own items to the front and keeps the order of the rest', () => {
    const items = [
      { id: 1, isOwn: false },
      { id: 2, isOwn: false },
      { id: 3, isOwn: true },
    ];

    expect(toOwnFirst(items).map((item) => item.id)).toEqual([3, 1, 2]);
  });
});

describe('toCappedList', () => {
  it.each([
    [[1, 2, 3], 5, false, [1, 2, 3], 0],
    [[1, 2, 3, 4, 5, 6], 5, false, [1, 2, 3, 4, 5], 1],
    [[1, 2, 3, 4, 5, 6], 5, true, [1, 2, 3, 4, 5, 6], 0],
  ])('caps %j at %i (expanded %s)', (items, limit, expanded, shown, hidden) => {
    expect(toCappedList(items, limit, expanded)).toEqual({ shown, hidden });
  });
});

describe('toSheetTabs', () => {
  it('keeps only tabs whose names are known and not empty', () => {
    const tabs = toSheetTabs([
      { id: 'yes', label: 'Zusage', count: 1, entries: [entry('1', 'Lena Brandt')] },
      { id: 'maybe', label: 'Vielleicht', count: 0, entries: [] },
      { id: 'no', label: 'Absage', count: 3, entries: null },
    ]);

    expect(tabs.map((tab) => tab.id)).toEqual(['yes']);
  });
});

describe('toCurrentTab', () => {
  const tabs = [
    { id: 'yes', label: 'Zusage', count: 1, entries: [entry('1', 'Lena Brandt')] },
    { id: 'open', label: 'Offen', count: 1, entries: [entry('2', 'Frank Weber')] },
  ];

  it.each([
    ['open', 'open'],
    ['gone', 'yes'],
    [null, 'yes'],
  ])('picks %j as %s', (tabId, expected) => {
    expect(toCurrentTab(tabs, tabId)?.id).toBe(expected);
  });

  it('has no tab without tabs', () => {
    expect(toCurrentTab([], 'yes')).toBeNull();
  });
});
