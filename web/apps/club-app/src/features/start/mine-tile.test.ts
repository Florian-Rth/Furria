import { describe, expect, it } from 'vitest';
import type { PersonFunction } from '@/lib/api/schemas';
import { needsAttention, tileFactsOf, toMineCoin } from './mine-tile';
import type { StartMine } from './schemas';

const mine = (kind: StartMine['kind'], years: number | null = null): StartMine => ({
  kind,
  subjectId: 7,
  on: '2026-10-17',
  until: '2026-10-30',
  name: 'Tanzgarde',
  groupTone: 'rose',
  function: null,
  changedBy: null,
  sessionStartYear: null,
  years,
  permissionKeys: null,
});

describe('tileFactsOf', () => {
  it('leaves the milestone to the greeting', () => {
    expect(tileFactsOf([mine('milestone', 40), mine('newKey')]).map((item) => item.kind)).toEqual([
      'newKey',
    ]);
  });
});

describe('needsAttention', () => {
  it.each([
    [[mine('newKey')], false],
    [[mine('newKey'), mine('membershipEnding')], true],
  ])('flags %# for attention', (items, expected) => {
    expect(needsAttention(items)).toBe(expected);
  });
});

const seat: PersonFunction = { kind: 'boardSeat', name: 'Präsident', icon: 'crown', tone: 'iris' };

describe('toMineCoin', () => {
  it.each([
    [mine('newGroupMembership'), 'rose'],
    [mine('newGroupAdmin'), 'rose'],
    [mine('newKey'), undefined],
    [{ ...mine('newGroupMembership'), subjectId: null }, undefined],
  ])('tones coin %# by its group', (item, expected) => {
    expect(toMineCoin(item, []).groupTone).toBe(expected);
  });

  it.each([
    [
      { ...mine('newBoardSeat'), name: 'Präsident' },
      { glyph: 'crown', groupTone: 'iris' },
    ],
    [
      { ...mine('newRole'), name: 'Präsident' },
      { glyph: undefined, groupTone: undefined },
    ],
    [
      { ...mine('newBoardSeat'), name: 'Kassier' },
      { glyph: undefined, groupTone: undefined },
    ],
  ])('wears the coin of the held function %#', (item, expected) => {
    const coin = toMineCoin(item, [seat]);

    expect({ glyph: coin.glyph, groupTone: coin.groupTone }).toEqual(expected);
  });
});
