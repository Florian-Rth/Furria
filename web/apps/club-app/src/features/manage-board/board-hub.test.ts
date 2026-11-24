import { describe, expect, it } from 'vitest';
import {
  canSeatOffice,
  firstDayAfter,
  isOfficeVacant,
  seatPhaseOf,
  toQueueItems,
} from './board-hub';
import type { BoardOffice, BoardSeat } from './schemas';

const TODAY = '2026-10-20';

const seat = (boardSeatId: number, sinceOn: string, untilOn: string | null): BoardSeat => ({
  boardSeatId,
  personId: boardSeatId,
  firstName: 'Vor',
  lastName: `Name${boardSeatId}`,
  sinceOn,
  untilOn,
  honours: { sessions: 0, functions: [] },
});

const office = (
  boardOfficeId: number,
  seats: BoardSeat[],
  pastSeats: BoardSeat[] = [],
  extra: Partial<BoardOffice> = {},
): BoardOffice => ({
  boardOfficeId,
  name: `Office${boardOfficeId}`,
  sortOrder: boardOfficeId,
  impliedRoleId: null,
  impliedRoleName: null,
  isPublic: true,
  icon: null,
  archivedOn: null,
  seats,
  pastSeats,
  ...extra,
});

describe('toQueueItems', () => {
  it('raises a vacancy dated the day after the last seat ended', () => {
    const last = seat(9, '2020-01-01', '2026-09-29');
    const items = toQueueItems([office(1, [], [seat(8, '2010-01-01', '2019-12-31'), last])], TODAY);

    expect(items).toEqual([
      { kind: 'vacant', key: 'vacant-1', boardOfficeId: 1, day: '2026-09-30', lastSeat: last },
    ]);
  });

  it('pairs an ending seat with its successor into one handover', () => {
    const outgoing = seat(1, '2020-01-01', '2026-10-31');
    const incoming = seat(2, '2026-11-01', null);
    const items = toQueueItems([office(1, [incoming, outgoing])], TODAY);

    expect(items).toEqual([
      {
        kind: 'handover',
        key: 'handover-2',
        boardOfficeId: 1,
        outgoing,
        incoming,
        day: '2026-11-01',
      },
    ]);
  });

  it('flags an ending seat without successor', () => {
    const items = toQueueItems([office(1, [seat(1, '2020-01-01', '2026-11-30')])], TODAY);

    expect(items.map((item) => [item.kind, item.day])).toEqual([['ending', '2026-11-30']]);
  });

  it('treats a vacant office with a planned start as a handover, not a vacancy', () => {
    const items = toQueueItems([office(1, [seat(1, '2026-12-01', null)])], TODAY);

    expect(items.map((item) => item.kind)).toEqual(['handover']);
  });
});

describe('canSeatOffice', () => {
  it.each([
    [7, false, null, false],
    [7, true, null, true],
    [null, true, '2025-01-01', false],
  ] as const)('role %s, roles.manage %s, archived %s → %s', (roleId, canRoles, archivedOn, can) => {
    expect(canSeatOffice(office(1, [], [], { impliedRoleId: roleId, archivedOn }), canRoles)).toBe(
      can,
    );
  });
});

describe('isOfficeVacant', () => {
  it.each([
    [[seat(1, '2027-01-01', null)], null, true],
    [[], '2025-01-01', false],
  ] as const)('seats %j, archived %s → %s', (seats, archivedOn, vacant) => {
    expect(isOfficeVacant(office(1, [...seats], [], { archivedOn }), TODAY)).toBe(vacant);
  });
});

describe('firstDayAfter', () => {
  it('starts a successor the day after the ending seat', () => {
    const [item] = toQueueItems([office(1, [seat(1, '2020-01-01', '2026-12-31')])], TODAY);

    expect(item === undefined ? null : firstDayAfter(item, TODAY)).toBe('2027-01-01');
  });
});

describe('seatPhaseOf', () => {
  it.each([
    ['2020-01-01', '2026-10-20', 'ending'],
    ['2026-10-21', null, 'planned'],
    ['2020-01-01', '2026-10-19', 'past'],
  ] as const)('%s – %s is %s', (sinceOn, untilOn, phase) => {
    expect(seatPhaseOf(seat(1, sinceOn, untilOn), TODAY)).toBe(phase);
  });
});
