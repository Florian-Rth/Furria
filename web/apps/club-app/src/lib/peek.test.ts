import { describe, expect, it } from 'vitest';
import { toPeekedId, toPeekId } from './peek';

describe('toPeekId', () => {
  it.each([
    { kind: 'member', id: 42, expected: 'member-42' },
    { kind: 'group', id: 7, expected: 'group-7' },
    { kind: 'venue', id: 3, expected: 'venue-3' },
    { kind: 'entry', id: 811, expected: 'entry-811' },
    { kind: 'role', id: 4, expected: 'role-4' },
    { kind: 'office', id: 2, expected: 'office-2' },
    { kind: 'start-announcements', id: 19, expected: 'start-announcements-19' },
  ] as const)('names the $kind sheet $expected', ({ kind, id, expected }) => {
    expect(toPeekId(kind, id)).toBe(expected);
  });
});

describe('toPeekedId', () => {
  it.each([
    { label: 'no sheet is open', sheetId: null, expected: null },
    { label: 'the sheet belongs to another kind', sheetId: 'group-7', expected: null },
    { label: 'the kind is a prefix of another kind', sheetId: 'members-7', expected: null },
    { label: 'the id is missing', sheetId: 'member-', expected: null },
    { label: 'the id is not a number', sheetId: 'member-abc', expected: null },
    { label: 'the id is zero', sheetId: 'member-0', expected: null },
    { label: 'the id is negative', sheetId: 'member--3', expected: null },
    { label: 'the id carries a leading zero', sheetId: 'member-007', expected: null },
    { label: 'the sheet names this member', sheetId: 'member-42', expected: 42 },
  ])('is $expected when $label', ({ sheetId, expected }) => {
    expect(toPeekedId(sheetId, 'member')).toBe(expected);
  });

  it.each([
    { label: 'the line names one announcement', sheetId: 'start-announcements-19', expected: 19 },
    {
      label: 'the foot opens every new announcement',
      sheetId: 'start-announcements',
      expected: null,
    },
    { label: 'another start sheet is open', sheetId: 'start-calendar', expected: null },
  ])('reads $expected for the announcements sheet when $label', ({ sheetId, expected }) => {
    expect(toPeekedId(sheetId, 'start-announcements')).toBe(expected);
  });

  it('round-trips what toPeekId produced', () => {
    expect(toPeekedId(toPeekId('group', 13), 'group')).toBe(13);
  });
});
