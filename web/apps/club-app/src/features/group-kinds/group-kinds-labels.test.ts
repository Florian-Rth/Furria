import { describe, expect, it } from 'vitest';
import {
  NO_GROUP_KIND_VALUE,
  toGroupKindId,
  toGroupKindOptions,
  toGroupKindValue,
  toHeldGroupKind,
} from './group-kinds-labels';

const KINDS = [
  { groupKindId: 3, name: 'Zugabteilung' },
  { groupKindId: 1, name: 'Ältestenrat' },
  { groupKindId: 2, name: 'Garde' },
];

describe('toGroupKindOptions', () => {
  it('leads with the empty choice and keeps the order the Gruppenverwaltung set', () => {
    const options = toGroupKindOptions(KINDS, null);

    expect(options.map((option) => option.value)).toEqual(['', '3', '1', '2']);
  });

  it('offers the empty choice alone when nothing is running', () => {
    expect(toGroupKindOptions([], null)).toHaveLength(1);
  });

  it('adds no second entry when the held Gruppenart is running', () => {
    const options = toGroupKindOptions(KINDS, { groupKindId: 2, name: 'Garde' });

    expect(options.map((option) => option.value)).toEqual(['', '3', '1', '2']);
  });

  it('keeps the held Gruppenart offered when it left the running list', () => {
    const options = toGroupKindOptions(KINDS, { groupKindId: 9, name: 'Spielmannszug' });

    expect(options.at(-1)).toEqual({ value: '9', label: 'Spielmannszug — archiviert' });
  });
});

describe('toHeldGroupKind', () => {
  it.each([
    [null, null],
    [7, null],
    [null, 'Garde'],
  ])('reads %s / %s as nothing held', (groupKindId, groupKindName) => {
    expect(toHeldGroupKind(groupKindId, groupKindName)).toBeNull();
  });

  it('pairs the id with the name the Gruppe carries', () => {
    expect(toHeldGroupKind(7, 'Garde')).toEqual({ groupKindId: 7, name: 'Garde' });
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
