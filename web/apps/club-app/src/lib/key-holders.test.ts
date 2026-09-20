import { describe, expect, it } from 'vitest';
import { toKeyHolderEntries, toKeyVenueSummary } from './key-holders';

interface Holding {
  person: { personId: number; firstName: string; lastName: string };
  sinceOn: string;
}

const holdingOf = (
  personId: number,
  firstName: string,
  lastName: string,
  sinceOn: string,
): Holding => ({ person: { personId, firstName, lastName }, sinceOn });

const anna = holdingOf(7, 'Anna', 'Berg', '2026-01-05');
const bert = holdingOf(2, 'Bert', 'Cramer', '2025-11-11');
const cleo = holdingOf(3, 'Cleo', 'Daum', '2024-02-29');

describe('toKeyVenueSummary', () => {
  it.each([
    { label: 'nobody holds a key', holdings: [], expected: 0 },
    { label: 'one person holds a key', holdings: [anna], expected: 1 },
    { label: 'three people hold a key', holdings: [anna, bert, cleo], expected: 3 },
  ])('counts $expected holders when $label', ({ holdings, expected }) => {
    expect(toKeyVenueSummary(holdings).holderCount).toBe(expected);
  });

  it.each([
    { label: 'no holder is left to name', holdings: [], standsIn: true },
    { label: 'a holder can be named', holdings: [anna], standsIn: false },
  ])('stands in for the faces: $standsIn when $label', ({ holdings, standsIn }) => {
    expect(toKeyVenueSummary(holdings).emptyLine !== null).toBe(standsIn);
  });

  it('takes the initials in the order the holders arrive', () => {
    expect(toKeyVenueSummary([anna, bert]).initials).toEqual(['AB', 'BC']);
  });
});

describe('toKeyHolderEntries', () => {
  it('names nobody when nobody holds a key', () => {
    expect(toKeyHolderEntries([])).toEqual([]);
  });

  it.each([
    { sinceOn: '2026-01-05', expected: '05.01.2026' },
    { sinceOn: '2025-11-11', expected: '11.11.2025' },
    { sinceOn: '2024-02-29', expected: '29.02.2024' },
  ])('reads $sinceOn as $expected', ({ sinceOn, expected }) => {
    const [entry] = toKeyHolderEntries([holdingOf(1, 'Anna', 'Berg', sinceOn)]);

    expect(entry?.sinceValue).toBe(expected);
  });

  it('joins the split name and derives the initials', () => {
    expect(toKeyHolderEntries([anna])).toEqual([
      { personId: 7, name: 'Anna Berg', initials: 'AB', sinceValue: '05.01.2026' },
    ]);
  });

  it('keeps one entry per holding, in the order they arrive', () => {
    expect(toKeyHolderEntries([bert, anna]).map((entry) => entry.personId)).toEqual([2, 7]);
  });
});
