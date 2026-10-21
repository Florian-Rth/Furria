import { describe, expect, it } from 'vitest';
import {
  canSeatOffice,
  filterQueue,
  firstDayAfter,
  formatMonthYear,
  formatQueueDay,
  isOfficeVacant,
  primaryActionOf,
  queueActionOf,
  relativeDayOf,
  seatPhaseOf,
  toBoardSummary,
  toEditorLanding,
  toHeldOffices,
  toOfficeMarkState,
  toQueueCounts,
  toQueueItems,
  toRunningSeats,
  toSeatChain,
  toShortName,
  vacantSinceOf,
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

  it('dates a never held vacancy with no day', () => {
    expect(toQueueItems([office(1, [])], TODAY)[0]).toMatchObject({
      kind: 'vacant',
      day: null,
      lastSeat: null,
    });
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

  it('raises nothing for a quietly held office or an archived one', () => {
    const items = toQueueItems(
      [office(1, [seat(1, '2020-01-01', null)]), office(2, [], [], { archivedOn: '2025-04-30' })],
      TODAY,
    );

    expect(items).toEqual([]);
  });

  it('puts vacancies first, then the rest by date', () => {
    const items = toQueueItems(
      [
        office(1, [seat(1, '2020-01-01', '2026-12-31')]),
        office(2, [seat(2, '2026-11-02', null)]),
        office(3, []),
      ],
      TODAY,
    );

    expect(items.map((item) => item.boardOfficeId)).toEqual([3, 2, 1]);
  });
});

describe('toQueueCounts', () => {
  it('counts each kind and the active offices hidden from the website', () => {
    const offices = [
      office(1, []),
      office(2, [seat(2, '2020-01-01', '2026-11-30')], [], { isPublic: false }),
      office(3, [], [], { isPublic: false, archivedOn: '2025-01-01' }),
    ];

    expect(toQueueCounts(toQueueItems(offices, TODAY), offices)).toEqual({
      vacant: 1,
      handover: 0,
      ending: 1,
      offline: 1,
    });
  });
});

describe('filterQueue and toHeldOffices', () => {
  const offices = [
    office(1, [seat(1, '2020-01-01', '2026-11-30')], [], { isPublic: false }),
    office(2, [seat(2, '2020-01-01', null)]),
    office(3, []),
  ];
  const items = toQueueItems(offices, TODAY);

  it.each([
    ['all', [3, 1], [1, 2]],
    ['vacant', [3], []],
    ['ending', [1], [1]],
    ['handover', [], []],
    ['offline', [1], [1]],
  ] as const)('filter %s keeps the matching items and held offices', (filter, queue, held) => {
    expect(filterQueue(items, offices, filter).map((item) => item.boardOfficeId)).toEqual(queue);
    expect(
      toHeldOffices(offices, items, filter, TODAY).map((entry) => entry.boardOfficeId),
    ).toEqual(held);
  });
});

describe('vacantSinceOf', () => {
  it('takes the latest end among past seats', () => {
    expect(
      vacantSinceOf([seat(1, '2010-01-01', '2015-12-31'), seat(2, '2016-01-01', '2026-02-28')]),
    ).toBe('2026-03-01');
  });
});

describe('canSeatOffice', () => {
  it.each([
    [null, false, null, true],
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
    [[], null, true],
    [[seat(1, '2020-01-01', null)], null, false],
    [[seat(1, '2027-01-01', null)], null, true],
    [[], '2025-01-01', false],
  ] as const)('seats %j, archived %s → %s', (seats, archivedOn, vacant) => {
    expect(isOfficeVacant(office(1, [...seats], [], { archivedOn }), TODAY)).toBe(vacant);
  });
});

describe('toOfficeMarkState', () => {
  it.each([
    [null, false, 'held'],
    [null, true, 'vacant'],
    ['2025-01-01', false, 'archived'],
  ] as const)('archived %s, vacant %s → %s', (archivedOn, vacant, state) => {
    expect(toOfficeMarkState(office(1, [], [], { archivedOn }), vacant)).toBe(state);
  });
});

describe('firstDayAfter', () => {
  it('starts a successor the day after the ending seat', () => {
    const [item] = toQueueItems([office(1, [seat(1, '2020-01-01', '2026-12-31')])], TODAY);

    expect(item === undefined ? null : firstDayAfter(item, TODAY)).toBe('2027-01-01');
  });

  it('fills a vacancy from today', () => {
    const [item] = toQueueItems([office(1, [])], TODAY);

    expect(item === undefined ? null : firstDayAfter(item, TODAY)).toBe(TODAY);
  });
});

describe('seatPhaseOf', () => {
  it.each([
    ['2020-01-01', null, 'running'],
    ['2020-01-01', '2026-10-20', 'ending'],
    ['2026-10-21', null, 'planned'],
    ['2020-01-01', '2026-10-19', 'past'],
  ] as const)('%s – %s is %s', (sinceOn, untilOn, phase) => {
    expect(seatPhaseOf(seat(1, sinceOn, untilOn), TODAY)).toBe(phase);
  });
});

describe('formatQueueDay', () => {
  it.each([
    ['2026-09-30', '30.09.'],
    ['2027-01-01', '01.01.2027'],
  ])('%s → %s', (day, formatted) => {
    expect(formatQueueDay(day, TODAY)).toBe(formatted);
  });
});

describe('relativeDayOf', () => {
  it.each([
    ['2026-10-20', { kind: 'today' }],
    ['2026-10-21', { kind: 'tomorrow' }],
    ['2026-11-01', { kind: 'ahead', days: 12 }],
    ['2026-09-30', { kind: 'behind', days: 20 }],
    ['2027-03-29', { kind: 'ahead', days: 160 }],
  ])('%s', (day, expected) => {
    expect(relativeDayOf(day, TODAY)).toEqual(expected);
  });
});

describe('queueActionOf', () => {
  const offices = [
    office(1, []),
    office(2, [seat(2, '2020-01-01', '2026-11-30')]),
    office(3, [seat(3, '2026-11-02', null)]),
  ];
  const items = toQueueItems(offices, TODAY);

  it.each([
    [true, ['fill', null, 'succeed']],
    [false, [null, null, null]],
  ] as const)('may seat %s', (canSeat, actions) => {
    expect(items.map((item) => queueActionOf(item, canSeat))).toEqual(actions);
  });
});

describe('primaryActionOf', () => {
  it.each([
    ['vacant', office(1, []), true, { kind: 'fill', sinceOn: TODAY }],
    [
      'ending without successor',
      office(1, [seat(1, '2020-01-01', '2026-10-31')]),
      true,
      { kind: 'succeed', sinceOn: '2026-11-01' },
    ],
    [
      'handover planned',
      office(1, [seat(2, '2026-11-01', null), seat(1, '2020-01-01', '2026-10-31')]),
      true,
      { kind: 'add', sinceOn: TODAY },
    ],
    ['held', office(1, [seat(1, '2020-01-01', null)]), true, { kind: 'add', sinceOn: TODAY }],
    ['not allowed', office(1, []), false, null],
  ] as const)('%s', (_case, entry, canSeat, expected) => {
    expect(primaryActionOf(entry, TODAY, canSeat)).toEqual(expected);
  });
});

describe('toBoardSummary', () => {
  it('counts held active offices and finds the earliest change, an end before a start', () => {
    const ending = seat(1, '2020-01-01', '2026-10-31');
    const offices = [
      office(1, [seat(2, '2026-10-31', null), ending]),
      office(2, [seat(3, '2020-01-01', null)]),
      office(3, []),
      office(4, [seat(4, '2020-01-01', null)], [], { archivedOn: '2025-01-01' }),
    ];

    expect(toBoardSummary(offices, TODAY)).toEqual({
      held: 2,
      active: 3,
      next: { kind: 'ends', day: '2026-10-31', seat: ending },
    });
  });

  it('has no next change on a quiet board', () => {
    expect(toBoardSummary([office(1, [seat(1, '2020-01-01', null)])], TODAY).next).toBeNull();
  });
});

describe('toRunningSeats', () => {
  it('keeps running seats, oldest first', () => {
    const entry = office(1, [
      seat(3, '2026-11-01', null),
      seat(2, '2023-03-01', null),
      seat(1, '2015-11-11', null),
    ]);

    expect(toRunningSeats(entry, TODAY).map((item) => item.boardSeatId)).toEqual([1, 2]);
  });
});

describe('toSeatChain', () => {
  it('lists planned, running and past seats newest first', () => {
    const entry = office(
      1,
      [seat(1, '2022-03-12', '2026-10-31'), seat(2, '2026-11-01', null)],
      [seat(3, '2016-03-05', '2022-03-11')],
    );

    expect(toSeatChain(entry).map((item) => item.boardSeatId)).toEqual([2, 1, 3]);
  });
});

describe('formatMonthYear', () => {
  it('formats month and year', () => {
    expect(formatMonthYear('2022-03-12')).toBe('03/2022');
  });
});

describe('toShortName', () => {
  it.each([
    ['Bernd', 'Schulze', 'B. Schulze'],
    ['', 'Schulze', 'Schulze'],
  ])('%s %s → %s', (firstName, lastName, short) => {
    expect(toShortName({ firstName, lastName })).toBe(short);
  });
});

describe('toEditorLanding', () => {
  it.each([
    ['new', { to: '/manage/board', mark: { kind: 'board-office', id: 7 } }],
    ['hub', { to: '/manage/board', search: { office: 7 }, mark: { kind: 'board-office', id: 7 } }],
    ['office', { to: '/manage/board/$boardOfficeId', params: { boardOfficeId: 7 } }],
  ] as const)('returns %s', (returnTo, landing) => {
    expect(toEditorLanding(7, returnTo)).toEqual(landing);
  });
});
