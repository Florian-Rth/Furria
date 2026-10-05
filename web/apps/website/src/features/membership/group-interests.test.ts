import { describe, expect, it } from 'vitest';
import type { PublicGroup } from '@/lib/public-groups/schemas';
import { selectGroupLabels, selectKnownGroupIds, toggleGroupInterest } from './group-interests';

const group = (groupId: number, name: string): PublicGroup => ({
  groupId,
  name,
  description: '',
  isRecruiting: true,
  groupKindName: null,
  foundedYear: null,
  tone: null,
});

const roster: PublicGroup[] = [
  group(1, 'Tanzgarde'),
  group(4, 'Kindergarde'),
  group(9, 'Organisation'),
];

describe('toggleGroupInterest', () => {
  it('adds a group that was not picked yet', () => {
    expect(toggleGroupInterest([], 1)).toEqual([1]);
  });

  it('keeps several groups, because the interest is many-to-many', () => {
    expect(toggleGroupInterest([1], 9)).toEqual([1, 9]);
  });

  it('drops a group that was picked before', () => {
    expect(toggleGroupInterest([1, 9], 1)).toEqual([9]);
  });

  it('treats an empty answer as a normal answer', () => {
    expect(toggleGroupInterest([1], 1)).toEqual([]);
  });

  it('never mutates the answer it was given', () => {
    const selected = [1];

    toggleGroupInterest(selected, 9);

    expect(selected).toEqual([1]);
  });
});

describe('selectKnownGroupIds', () => {
  it('keeps the ids the roster answers to, in the order they arrived', () => {
    expect(selectKnownGroupIds(roster, [9, 1])).toEqual([9, 1]);
  });

  it('drops an id no group answers to instead of passing it on', () => {
    expect(selectKnownGroupIds(roster, [1, 42])).toEqual([1]);
  });

  it('drops everything while no roster is loaded', () => {
    expect(selectKnownGroupIds([], [1])).toEqual([]);
  });

  it('never mutates the selection it was given', () => {
    const selected = [1, 42];

    selectKnownGroupIds(roster, selected);

    expect(selected).toEqual([1, 42]);
  });
});

describe('selectGroupLabels', () => {
  it('names the picked groups in roster order, not click order', () => {
    expect(selectGroupLabels(roster, [9, 1])).toEqual(['Tanzgarde', 'Organisation']);
  });

  it('ignores an id no group answers to', () => {
    expect(selectGroupLabels(roster, [42])).toEqual([]);
  });
});
