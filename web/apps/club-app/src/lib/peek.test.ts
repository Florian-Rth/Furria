import { describe, expect, it } from 'vitest';
import { type PeekKind, toPeekedId } from './peek';

describe('toPeekedId', () => {
  it.each<{ label: string; sheetId: string | null; kind: PeekKind; expected: number | null }>([
    { label: 'no sheet is open', sheetId: null, kind: 'member', expected: null },
    {
      label: 'the sheet belongs to another kind',
      sheetId: 'group-7',
      kind: 'member',
      expected: null,
    },
    {
      label: 'the kind is a prefix of another kind',
      sheetId: 'members-7',
      kind: 'member',
      expected: null,
    },
    { label: 'the id is not a positive id', sheetId: 'member-007', kind: 'member', expected: null },
    { label: 'the sheet names this member', sheetId: 'member-42', kind: 'member', expected: 42 },
    {
      label: 'a hyphenated kind names one entry',
      sheetId: 'start-announcements-19',
      kind: 'start-announcements',
      expected: 19,
    },
    {
      label: 'a hyphenated kind names no entry',
      sheetId: 'start-announcements',
      kind: 'start-announcements',
      expected: null,
    },
  ])('is $expected when $label', ({ sheetId, kind, expected }) => {
    expect(toPeekedId(sheetId, kind)).toBe(expected);
  });
});
