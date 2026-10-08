import { describe, expect, it } from 'vitest';
import {
  isVacantOn,
  seatPeriodKindOf,
  toBoardEntries,
  toImpliedRoleChoices,
  toImpliedRoleId,
  toImpliedRoleValue,
} from './manage-board-labels';
import type { BoardOffice, BoardSeat } from './schemas';

const TODAY = '2026-09-20';

const seat = (overrides: Partial<BoardSeat> & { boardSeatId: number }): BoardSeat => ({
  personId: 1,
  firstName: 'Ilka',
  lastName: 'Reineke',
  sinceOn: '2016-11-11',
  untilOn: null,
  ...overrides,
});

const office = (
  overrides: Partial<BoardOffice> & { boardOfficeId: number; name: string },
): BoardOffice => ({
  sortOrder: 1,
  impliedRoleId: null,
  impliedRoleName: null,
  isPublic: false,
  archivedOn: null,
  seats: [],
  pastSeats: [],
  ...overrides,
});

describe('isVacantOn', () => {
  it.each([
    { scenario: 'nobody was ever seated', seats: [], expected: true },
    {
      scenario: 'an open seat started in the past',
      seats: [seat({ boardSeatId: 1 })],
      expected: false,
    },
    {
      scenario: 'the only seat starts tomorrow',
      seats: [seat({ boardSeatId: 1, sinceOn: '2026-09-21' })],
      expected: true,
    },
    {
      scenario: 'the only seat starts today',
      seats: [seat({ boardSeatId: 1, sinceOn: TODAY })],
      expected: false,
    },
    {
      scenario: 'the seat ends today',
      seats: [seat({ boardSeatId: 1, untilOn: TODAY })],
      expected: false,
    },
    {
      scenario: 'the seat ended yesterday',
      seats: [seat({ boardSeatId: 1, untilOn: '2026-09-19' })],
      expected: true,
    },
  ])('is $expected when $scenario', ({ seats, expected }) => {
    expect(isVacantOn(seats, TODAY)).toBe(expected);
  });
});

describe('toBoardEntries', () => {
  const ids = (rows: readonly BoardOffice[]): number[] =>
    toBoardEntries(rows, TODAY).map((entry) => entry.boardOfficeId);

  it('reads the band in sort order and moves an archived board office behind it', () => {
    const offices = [
      office({ boardOfficeId: 3, name: 'Beisitzer', sortOrder: 3 }),
      office({ boardOfficeId: 9, name: 'Pressewart', sortOrder: 2, archivedOn: '2021-01-01' }),
      office({ boardOfficeId: 1, name: 'Präsident', sortOrder: 1 }),
    ];

    expect(ids(offices)).toEqual([1, 3, 9]);
  });

  it('breaks a shared place in the band by name', () => {
    const shared = [
      office({ boardOfficeId: 5, name: 'Zeugwart', sortOrder: 4 }),
      office({ boardOfficeId: 4, name: 'Ältestenrat', sortOrder: 4 }),
    ];

    expect(ids(shared)).toEqual([4, 5]);
  });
});

describe('seatPeriodKindOf', () => {
  it.each([
    {
      scenario: 'a seat that started before today',
      sinceOn: '2016-11-11',
      untilOn: null,
      expected: 'running',
    },
    { scenario: 'a seat starting today', sinceOn: TODAY, untilOn: null, expected: 'running' },
    {
      scenario: 'a seat not started yet',
      sinceOn: '2026-11-11',
      untilOn: null,
      expected: 'upcoming',
    },
    { scenario: 'a dated seat', sinceOn: '2016-11-11', untilOn: '2026-11-10', expected: 'span' },
  ])('reads $scenario as $expected', ({ sinceOn, untilOn, expected }) => {
    expect(seatPeriodKindOf(seat({ boardSeatId: 1, sinceOn, untilOn }), TODAY)).toBe(expected);
  });
});

describe('toImpliedRoleChoices', () => {
  const roles = [
    { roleId: 2, name: 'Vereinsleitung', archivedOn: null },
    { roleId: 5, name: 'Chronik', archivedOn: '2021-01-01' },
  ];

  it.each([
    {
      scenario: 'drops an archived role nobody points at',
      id: null,
      name: null,
      expected: ['', '2'],
    },
    {
      scenario: 'keeps the archived role the board office points at',
      id: 5,
      name: 'Chronik',
      expected: ['', '2', '5'],
    },
    {
      scenario: 'carries a pointed-at role the list never returned',
      id: 8,
      name: 'Vorstand',
      expected: ['', '8', '2'],
    },
  ])('$scenario', ({ id, name, expected }) => {
    expect(toImpliedRoleChoices(roles, id, name).map((option) => option.value)).toEqual(expected);
  });
});

describe('implied role values', () => {
  it.each([
    { value: '', expected: null },
    { value: '7', expected: 7 },
  ])('reads $value as $expected', ({ value, expected }) => {
    expect(toImpliedRoleId(value)).toBe(expected);
  });

  it.each([
    { impliedRoleId: null, expected: '' },
    { impliedRoleId: 7, expected: '7' },
  ])('writes $impliedRoleId as $expected', ({ impliedRoleId, expected }) => {
    expect(toImpliedRoleValue(impliedRoleId)).toBe(expected);
  });
});
