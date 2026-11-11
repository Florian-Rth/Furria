import { describe, expect, it } from 'vitest';
import { arrivalShowOf, displayNameOf, freshMembersOf, wallNamesOf } from './arrival-show';
import type { PromoMember } from './schemas';

const member = (accountId: number, firstName: string, lastInitial: string): PromoMember => ({
  accountId,
  firstName,
  lastInitial,
  arrivedAt: null,
});

describe('displayNameOf', () => {
  it.each([
    { lastInitial: 'M', expected: 'Anna M.' },
    { lastInitial: '', expected: 'Anna' },
  ])('formats $lastInitial as $expected', ({ lastInitial, expected }) => {
    expect(displayNameOf(member(1, 'Anna', lastInitial))).toBe(expected);
  });
});

describe('freshMembersOf', () => {
  it('keeps only members not seen before, in list order', () => {
    const fresh = freshMembersOf(new Set([2]), [
      member(1, 'A', 'A'),
      member(2, 'B', 'B'),
      member(3, 'C', 'C'),
    ]);

    expect(fresh.map((item) => item.accountId)).toEqual([1, 3]);
  });
});

describe('arrivalShowOf', () => {
  it.each([
    { count: 1, names: 1, more: 0, ms: 4600 },
    { count: 3, names: 3, more: 0, ms: 5500 },
    { count: 7, names: 4, more: 3, ms: 5950 },
  ])('shows $names of $count names for $ms ms', ({ count, names, more, ms }) => {
    const queue = Array.from({ length: count }, (_, index) => member(index, `P${index}`, 'X'));
    const show = arrivalShowOf(queue);

    expect({ names: show.names.length, more: show.more, ms: show.ms }).toEqual({ names, more, ms });
  });
});

describe('wallNamesOf', () => {
  const members = [member(1, 'Anna', 'M'), member(2, 'Ben', 'K')];

  it('marks members who joined since the loop started', () => {
    expect(wallNamesOf(members, new Set([1])).map((entry) => entry.fresh)).toEqual([false, true]);
  });

  it('marks nobody before the first list arrived', () => {
    expect(wallNamesOf(members, null).map((entry) => entry.fresh)).toEqual([false, false]);
  });
});
