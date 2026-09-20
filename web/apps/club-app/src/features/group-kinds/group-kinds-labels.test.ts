import { describe, expect, it } from 'vitest';
import {
  NO_GROUP_KIND_VALUE,
  toGroupKindId,
  toGroupKindOptions,
  toGroupKindValue,
} from './group-kinds-labels';

describe('toGroupKindOptions', () => {
  it('leads with the empty choice and sorts the rest as German', () => {
    const options = toGroupKindOptions([
      { groupKindId: 3, name: 'Zugabteilung' },
      { groupKindId: 1, name: 'Ältestenrat' },
      { groupKindId: 2, name: 'Garde' },
    ]);

    expect(options.map((option) => option.value)).toEqual(['', '1', '2', '3']);
  });

  it('offers the empty choice alone when nothing is running', () => {
    expect(toGroupKindOptions([])).toHaveLength(1);
  });
});

describe('toGroupKindId', () => {
  it.each([
    [NO_GROUP_KIND_VALUE, null],
    ['7', 7],
  ])('reads %s as %s', (value, expected) => {
    expect(toGroupKindId(value)).toBe(expected);
  });
});

describe('toGroupKindValue', () => {
  it.each([
    [null, ''],
    [7, '7'],
  ])('writes %s as %s', (groupKindId, expected) => {
    expect(toGroupKindValue(groupKindId)).toBe(expected);
  });
});
