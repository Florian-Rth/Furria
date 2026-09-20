import { describe, expect, it } from 'vitest';
import {
  isVacantOn,
  toBoardEntries,
  toBoardLead,
  toImpliedRoleChoices,
  toImpliedRoleId,
  toImpliedRoleValue,
  toSeatEndedMessage,
  toSeatOpenedMessage,
  toSeatPeriodLabel,
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
  const offices: readonly BoardOffice[] = [
    office({ boardOfficeId: 3, name: 'Beisitzer', sortOrder: 3 }),
    office({ boardOfficeId: 9, name: 'Pressewart', sortOrder: 2, archivedOn: '2021-01-01' }),
    office({
      boardOfficeId: 1,
      name: 'Präsident',
      sortOrder: 1,
      seats: [seat({ boardSeatId: 7 })],
    }),
  ];

  const ids = (rows: readonly BoardOffice[]): number[] =>
    toBoardEntries(rows, TODAY).map((entry) => entry.boardOfficeId);

  it('reads the band in sort order, not in the order the server listed', () => {
    expect(ids(offices)).toEqual([1, 3, 9]);
  });

  it('moves an archived Funktion behind the band it left', () => {
    const [, , last] = toBoardEntries(offices, TODAY);

    expect(last?.isArchived).toBe(true);
  });

  it('breaks a shared place in the band by name', () => {
    const shared = [
      office({ boardOfficeId: 5, name: 'Zeugwart', sortOrder: 4 }),
      office({ boardOfficeId: 4, name: 'Ältestenrat', sortOrder: 4 }),
    ];

    expect(ids(shared)).toEqual([4, 5]);
  });

  it('marks a Funktion nobody sits in', () => {
    const [first, second] = toBoardEntries(offices, TODAY);

    expect(first?.isVacant).toBe(false);
    expect(second?.isVacant).toBe(true);
  });
});

describe('toSeatPeriodLabel', () => {
  it('reads a running seat by its first day', () => {
    expect(toSeatPeriodLabel(seat({ boardSeatId: 1 }), TODAY)).toBe('seit 11.11.2016');
  });

  it('reads a seat that has not started yet in the future tense', () => {
    expect(toSeatPeriodLabel(seat({ boardSeatId: 1, sinceOn: '2026-11-11' }), TODAY)).toBe(
      'ab 11.11.2026',
    );
  });

  it('reads a dated seat as a span, whether it is over or only scheduled to end', () => {
    expect(toSeatPeriodLabel(seat({ boardSeatId: 1, untilOn: '2020-11-10' }), TODAY)).toBe(
      '11.11.2016 – 10.11.2020',
    );
    expect(toSeatPeriodLabel(seat({ boardSeatId: 1, untilOn: '2026-11-10' }), TODAY)).toBe(
      '11.11.2016 – 10.11.2026',
    );
  });
});

describe('toBoardLead', () => {
  const lead = (offices: readonly BoardOffice[]): string =>
    toBoardLead(toBoardEntries(offices, TODAY));

  it('stays silent about vacancies when every Funktion is filled', () => {
    expect(
      lead([
        office({
          boardOfficeId: 1,
          name: 'Präsident',
          seats: [seat({ boardSeatId: 7 })],
        }),
      ]),
    ).not.toContain('unbesetzt');
  });

  it('names the vacancy, because that is the alarm', () => {
    expect(
      lead([
        office({ boardOfficeId: 1, name: 'Präsident', seats: [seat({ boardSeatId: 7 })] }),
        office({ boardOfficeId: 2, name: 'Kassenwart', sortOrder: 2 }),
      ]),
    ).toContain('unbesetzt');
  });

  it('counts only the Funktionen that are still in the band', () => {
    expect(
      lead([
        office({ boardOfficeId: 1, name: 'Präsident', seats: [seat({ boardSeatId: 7 })] }),
        office({ boardOfficeId: 9, name: 'Pressewart', sortOrder: 2, archivedOn: '2021-01-01' }),
      ]),
    ).toContain('Eine Vorstandsfunktion');
  });

  it('counts an archived Funktion as unbesetzt nowhere', () => {
    expect(
      lead([
        office({ boardOfficeId: 9, name: 'Pressewart', sortOrder: 2, archivedOn: '2021-01-01' }),
      ]),
    ).not.toContain('unbesetzt');
  });
});

describe('toImpliedRoleChoices', () => {
  const roles = [
    { roleId: 2, name: 'Vereinsleitung', archivedOn: null },
    { roleId: 5, name: 'Chronik', archivedOn: '2021-01-01' },
  ];

  it('offers the empty choice first, so a Funktion may imply nothing', () => {
    const [first] = toImpliedRoleChoices(roles, null, null);

    expect(first?.value).toBe('');
  });

  it('drops an archived Rolle nobody points at', () => {
    expect(toImpliedRoleChoices(roles, null, null).map((option) => option.value)).toEqual([
      '',
      '2',
    ]);
  });

  it('keeps the archived Rolle the Funktion already points at, so the field is never blank', () => {
    expect(toImpliedRoleChoices(roles, 5, 'Chronik').map((option) => option.value)).toEqual([
      '',
      '2',
      '5',
    ]);
  });

  it('carries a pointed-at Rolle the list never returned', () => {
    expect(toImpliedRoleChoices(roles, 8, 'Vorstand').map((option) => option.value)).toEqual([
      '',
      '8',
      '2',
    ]);
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

describe('dated write messages', () => {
  it('names the day a seat only starts later', () => {
    expect(toSeatOpenedMessage('Ilka Reineke', 'Präsident', '2026-11-11', TODAY)).toContain(
      '11.11.2026',
    );
  });

  it('names no day for a seat that already runs', () => {
    expect(toSeatOpenedMessage('Ilka Reineke', 'Präsident', TODAY, TODAY)).not.toContain(
      '20.09.2026',
    );
  });

  it('speaks of a scheduled end in the future tense', () => {
    expect(toSeatEndedMessage('Ilka Reineke', '2026-11-10', TODAY)).toContain('endet am');
  });

  it('speaks of an end that has arrived in the past tense', () => {
    expect(toSeatEndedMessage('Ilka Reineke', TODAY, TODAY)).toContain('ist beendet');
  });
});
