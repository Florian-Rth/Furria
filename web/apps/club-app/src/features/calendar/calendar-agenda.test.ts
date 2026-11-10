import { describe, expect, it } from 'vitest';
import {
  dayToneOf,
  earlierWindowOf,
  fetchSpanOf,
  initialWindowOf,
  isoWeekOf,
  landingOf,
  laterWindowOf,
  leadEntryOf,
  linesByDay,
  monthDaysOf,
  owedIdsOf,
  relativeDayOf,
  toCalendarSections,
  toCalendarTime,
  toDayCells,
  usualsByDay,
  weekNameOf,
  windowCovering,
} from './calendar-agenda';
import type { CalendarEntry, UsualTraining } from './schemas';

const at = (day: string, time: string): string =>
  new Date(
    Number(day.slice(0, 4)),
    Number(day.slice(5, 7)) - 1,
    Number(day.slice(8, 10)),
    Number(time.slice(0, 2)),
    Number(time.slice(3, 5)),
  ).toISOString();

const entry = (
  calendarEntryId: number,
  startsAt: string,
  endsAt: string | null,
  extra: Partial<CalendarEntry> = {},
): CalendarEntry => ({
  calendarEntryId,
  title: `Eintrag ${calendarEntryId}`,
  startsAt,
  endsAt,
  kind: 'training',
  venueId: null,
  venueName: null,
  ownerGroupId: null,
  ownerGroupName: null,
  ownerGroupTone: null,
  participatingGroups: [],
  audience: 'club',
  audienceGroups: [],
  audiencePeople: [],
  asksForResponse: false,
  addOns: [],
  responseCount: 0,
  description: null,
  viewerAnswer: null,
  isRunning: false,
  event: null,
  ...extra,
});

const usual = (groupId: number, startsAt: string): UsualTraining => ({
  usualTrainingTimeId: groupId * 10,
  groupId,
  groupName: `Gruppe ${groupId}`,
  groupTone: 'teal',
  startsAt,
  endsAt: startsAt,
  venueId: null,
  venueName: null,
});

const NOW = Date.parse(at('2026-10-20', '12:00'));
const NONE = new Map<number, 'yes' | 'maybe' | 'no'>();

describe('windows', () => {
  it.each([
    [null, { from: '2026-10-20', to: '2027-02-17' }],
    ['2026-10-01', { from: '2026-09-28', to: '2027-02-17' }],
    ['2027-04-01', { from: '2026-10-20', to: '2027-04-29' }],
    ['2028-04-01', { from: '2026-10-20', to: '2027-11-23' }],
  ])('initial window for landing %s', (requested, expected) => {
    expect(initialWindowOf('2026-10-20', requested)).toEqual(expected);
  });

  it.each([
    [
      { from: '2026-10-20', to: '2027-02-17' },
      { from: '2026-10-19', to: '2027-02-17' },
    ],
    [
      { from: '2026-10-19', to: '2027-02-17' },
      { from: '2026-10-12', to: '2027-02-17' },
    ],
    [{ from: '2026-10-19', to: '2027-11-20' }, null],
  ])('earlier window of %o', (window, expected) => {
    expect(earlierWindowOf(window)).toEqual(expected);
  });

  it.each([
    [
      { from: '2026-10-20', to: '2027-02-17' },
      { from: '2026-10-20', to: '2027-04-14' },
    ],
    [
      { from: '2026-10-20', to: '2027-11-01' },
      { from: '2026-10-20', to: '2027-11-23' },
    ],
    [{ from: '2026-10-20', to: '2027-11-23' }, null],
  ])('later window of %o', (window, expected) => {
    expect(laterWindowOf(window)).toEqual(expected);
  });

  it.each([
    ['2026-10-25', { from: '2026-10-20', to: '2027-02-17' }],
    ['2026-10-08', { from: '2026-10-05', to: '2027-02-17' }],
    ['2027-03-01', { from: '2026-10-20', to: '2027-03-29' }],
  ])('window covering %s', (day, expected) => {
    expect(windowCovering({ from: '2026-10-20', to: '2027-02-17' }, day)).toEqual(expected);
  });
});

describe('isoWeekOf', () => {
  it.each([
    ['2026-10-20', 43],
    ['2026-01-01', 1],
    ['2027-01-01', 53],
    ['2027-01-04', 1],
    ['2026-12-28', 53],
  ])('%s is in week %d', (day, week) => {
    expect(isoWeekOf(day)).toBe(week);
  });
});

describe('monthDaysOf', () => {
  it('spans whole Monday-first weeks', () => {
    const days = monthDaysOf('2026-11-01');

    expect([days.length, days[0], days[days.length - 1]]).toEqual([42, '2026-10-26', '2026-12-06']);
  });
});

describe('owedIdsOf', () => {
  it('owes only unanswered, asking, unfinished entries', () => {
    const entries = [
      entry(1, at('2026-10-21', '19:00'), at('2026-10-21', '21:00'), { asksForResponse: true }),
      entry(2, at('2026-10-21', '19:00'), null, { asksForResponse: true, viewerAnswer: 'maybe' }),
      entry(3, at('2026-10-19', '19:00'), at('2026-10-19', '21:00'), { asksForResponse: true }),
      entry(4, at('2026-10-22', '19:00'), null),
      entry(5, at('2026-10-23', '19:00'), null, { asksForResponse: true }),
      entry(6, at('2026-10-20', '11:00'), at('2026-10-20', '13:00'), { asksForResponse: true }),
    ];

    expect(owedIdsOf(entries, NOW, new Map([[5, 'yes']]))).toEqual([1, 6]);
  });
});

describe('toCalendarSections', () => {
  const window = { from: '2026-10-20', to: '2026-11-02' };
  const entries = [
    entry(1, at('2026-10-20', '19:00'), at('2026-10-20', '21:00')),
    entry(2, at('2026-10-22', '19:00'), at('2026-10-22', '21:00')),
    entry(3, at('2026-10-31', '19:11'), at('2026-11-01', '01:00')),
    entry(4, at('2026-10-24', '08:00'), at('2026-10-25', '18:00')),
  ];

  it('groups days by week, collapses empty days, splits trips and hides weeks without appointments', () => {
    const sections = toCalendarSections(entries, [], window, '2026-10-20', null);

    expect(
      sections.map((section) => [
        section.key,
        section.items.map((item) =>
          item.kind === 'gap'
            ? `gap ${item.fromDay}..${item.toDay}`
            : `day ${item.isoDay} ${item.lines.map((line) => line.key).join(',')}`,
        ),
      ]),
    ).toEqual([
      [
        'week-2026-10-20',
        [
          'day 2026-10-20 1-2026-10-20',
          'gap 2026-10-21..2026-10-21',
          'day 2026-10-22 2-2026-10-22',
          'gap 2026-10-23..2026-10-23',
          'day 2026-10-24 4-2026-10-24',
          'day 2026-10-25 4-2026-10-25',
        ],
      ],
      [
        'week-2026-10-26',
        ['gap 2026-10-26..2026-10-30', 'day 2026-10-31 3-2026-10-31', 'gap 2026-11-01..2026-11-01'],
      ],
    ]);
  });

  it.each([
    ['only usual training times', [], [usual(3, at('2026-11-17', '19:30'))], '2026-11-02'],
    ['only a landmark', [], [], '2026-11-02'],
    ['nothing', [], [], '2026-11-02'],
  ])('hides a week holding %s', (_, weekEntries, weekUsuals, todayDay) => {
    const sections = toCalendarSections(
      weekEntries,
      weekUsuals,
      { from: '2026-11-09', to: '2026-11-22' },
      todayDay,
      null,
    );

    expect(sections.map((section) => section.key)).toEqual([]);
  });

  it('keeps the week of today without appointments, with today, landmarks and usual training times', () => {
    const sections = toCalendarSections(
      [],
      [usual(3, at('2026-11-12', '19:30'))],
      { from: '2026-11-09', to: '2026-11-15' },
      '2026-11-10',
      null,
    );

    expect(
      sections.flatMap((section) =>
        section.items.map((item) =>
          item.kind === 'day' ? [item.key, item.usuals.map((held) => held.groupId)] : [item.key],
        ),
      ),
    ).toEqual([
      ['gap-2026-11-09'],
      ['day-2026-11-10', []],
      ['day-2026-11-11', []],
      ['day-2026-11-12', [3]],
      ['gap-2026-11-13'],
    ]);
  });

  it('lists usual training times inside a week that holds appointments', () => {
    const sections = toCalendarSections(
      [entry(9, at('2026-11-18', '19:00'), null)],
      [usual(3, at('2026-11-17', '19:30'))],
      { from: '2026-11-16', to: '2026-11-22' },
      '2026-11-02',
      null,
    );

    expect(
      sections.flatMap((section) =>
        section.items.map((item) =>
          item.kind === 'day' ? [item.key, item.usuals.map((held) => held.groupId)] : [item.key],
        ),
      ),
    ).toEqual([
      ['gap-2026-11-16'],
      ['day-2026-11-17', [3]],
      ['day-2026-11-18', []],
      ['gap-2026-11-19'],
    ]);
  });

  it.each([
    ['2026-10-20', { key: 'day-2026-10-20', day: '2026-10-20' }],
    ['2026-10-21', { key: 'gap-2026-10-21', day: '2026-10-21' }],
    ['2026-10-27', { key: 'gap-2026-10-26', day: '2026-10-27' }],
    ['2026-11-02', { key: 'gap-2026-11-01', day: '2026-11-01' }],
  ])('lands %s at %o', (day, landing) => {
    expect(landingOf(toCalendarSections(entries, [], window, '2026-10-20', null), day)).toEqual(
      landing,
    );
  });

  it('lands a jump into a hidden week on the next week with appointments', () => {
    const sections = toCalendarSections(
      [entry(1, at('2026-11-02', '19:00'), null), entry(2, at('2026-11-25', '19:00'), null)],
      [],
      { from: '2026-11-02', to: '2026-11-29' },
      '2026-11-02',
      null,
    );

    expect(landingOf(sections, '2026-11-12')).toEqual({ key: 'gap-2026-11-23', day: '2026-11-23' });
  });

  it('reveals a picked day inside a week without appointments and lands on it', () => {
    const sections = toCalendarSections(
      [entry(1, at('2026-11-02', '19:00'), null), entry(2, at('2026-11-25', '19:00'), null)],
      [],
      { from: '2026-11-02', to: '2026-11-29' },
      '2026-11-02',
      '2026-11-12',
    );

    expect(sections.map((section) => section.key)).toEqual([
      'week-2026-11-02',
      'week-2026-11-09',
      'week-2026-11-23',
    ]);
    expect(landingOf(sections, '2026-11-12')).toEqual({ key: 'day-2026-11-12', day: '2026-11-12' });
  });

  it('lands nowhere without any shown day', () => {
    expect(landingOf([], '2026-11-12')).toBeNull();
  });
});

describe('weekNameOf', () => {
  it.each([
    ['2026-10-19', 'current'],
    ['2026-10-26', 'next'],
    ['2026-10-12', 'previous'],
    ['2026-11-02', 'numbered'],
    ['2026-10-05', 'numbered'],
  ] as const)('names the week of %s %s', (monday, name) => {
    expect(weekNameOf(monday, '2026-10-20')).toBe(name);
  });
});

describe('fetchSpanOf', () => {
  it.each([
    [
      { from: '2026-09-28', to: '2026-11-01' },
      { from: '2026-09-28', to: '2027-02-17' },
    ],
    [
      { from: '2027-03-01', to: '2027-04-04' },
      { from: '2026-10-20', to: '2027-04-04' },
    ],
    [
      { from: '2025-09-01', to: '2025-10-05' },
      { from: '2026-10-20', to: '2027-02-17' },
    ],
  ])('reaches the peeked grid %o', (peeked, expected) => {
    expect(fetchSpanOf({ from: '2026-10-20', to: '2027-02-17' }, peeked)).toEqual(expected);
  });
});

describe('toCalendarTime', () => {
  it.each([
    [
      entry(1, at('2026-10-20', '19:00'), at('2026-10-20', '21:00')),
      0,
      1,
      { kind: 'single', start: '19:00', end: '21:00', endDayOffset: 0 },
    ],
    [
      entry(2, at('2026-10-31', '19:11'), at('2026-11-01', '01:00')),
      0,
      1,
      { kind: 'single', start: '19:11', end: '01:00', endDayOffset: 1 },
    ],
    [
      entry(3, at('2026-10-20', '11:11'), null),
      0,
      1,
      { kind: 'single', start: '11:11', end: null, endDayOffset: 0 },
    ],
    [
      entry(4, at('2026-11-21', '08:00'), at('2026-11-22', '18:00')),
      0,
      2,
      { kind: 'first', start: '08:00', dayCount: 2 },
    ],
    [
      entry(4, at('2026-11-21', '08:00'), at('2026-11-22', '18:00')),
      1,
      2,
      { kind: 'continued', end: '18:00', dayIndex: 1, dayCount: 2 },
    ],
    [
      entry(5, at('2026-11-21', '08:00'), at('2026-11-23', '18:00')),
      1,
      3,
      { kind: 'continued', end: null, dayIndex: 1, dayCount: 3 },
    ],
  ])('times entry %#', (subject, dayIndex, dayCount, expected) => {
    expect(toCalendarTime({ key: 'k', entry: subject, dayIndex, dayCount })).toEqual(expected);
  });
});

describe('relative days', () => {
  it.each([
    ['2026-10-20', { kind: 'today' }, 'today'],
    ['2026-10-21', { kind: 'tomorrow' }, 'near'],
    ['2026-10-19', { kind: 'yesterday' }, 'past'],
    ['2026-10-26', { kind: 'ahead', days: 6 }, 'near'],
    ['2026-10-27', { kind: 'ahead', days: 7 }, 'quiet'],
    ['2026-10-10', { kind: 'past', days: 10 }, 'past'],
  ] as const)('%s', (day, relative, tone) => {
    const result = relativeDayOf(day, '2026-10-20');

    expect([result, dayToneOf(result)]).toEqual([relative, tone]);
  });
});

describe('toDayCells', () => {
  it('marks owners, owed days and landmarks', () => {
    const entries = [
      entry(1, at('2026-11-10', '19:00'), null, { asksForResponse: true }),
      entry(2, at('2026-11-10', '20:00'), null, { ownerGroupId: 3, ownerGroupTone: 'rose' }),
      entry(3, at('2026-11-10', '21:00'), null, { ownerGroupId: 3, ownerGroupTone: 'rose' }),
      entry(4, at('2026-11-10', '22:00'), null),
    ];
    const window = { from: '2026-11-09', to: '2026-11-15' };
    const cells = toDayCells(
      ['2026-11-10', '2026-11-11'],
      linesByDay(entries, window),
      new Map(),
      new Set([1]),
      '2026-11-11',
      '2026-11-01',
    );

    expect(
      cells.map((cell) => [cell.marks, cell.count, cell.owed, cell.landmark, cell.isPast]),
    ).toEqual([
      [['club', 'rose', 'rose'], 4, true, null, true],
      [[], 0, false, 'opening', false],
    ]);
  });

  it('rings usual training times in the marks the entries leave free', () => {
    const entries = [
      entry(1, at('2026-11-10', '19:00'), null),
      entry(2, at('2026-11-10', '20:00'), null, { ownerGroupId: 3, ownerGroupTone: 'rose' }),
    ];
    const window = { from: '2026-11-09', to: '2026-11-15' };
    const usuals = [
      usual(4, at('2026-11-10', '18:00')),
      usual(5, at('2026-11-10', '19:00')),
      usual(6, at('2026-11-12', '19:00')),
    ];
    const cells = toDayCells(
      ['2026-11-10', '2026-11-12'],
      linesByDay(entries, window),
      usualsByDay(usuals, window),
      new Set(),
      '2026-11-09',
      null,
    );

    expect(cells.map((cell) => [cell.marks.length, cell.usualMarks.length])).toEqual([
      [2, 1],
      [0, 1],
    ]);
  });
});

describe('usualsByDay', () => {
  it('orders a day by time and drops days outside the window', () => {
    const byDay = usualsByDay(
      [
        usual(2, at('2026-11-10', '20:00')),
        usual(1, at('2026-11-10', '18:00')),
        usual(3, at('2026-11-20', '18:00')),
      ],
      { from: '2026-11-09', to: '2026-11-15' },
    );

    expect([...byDay].map(([day, held]) => [day, held.map((one) => one.groupId)])).toEqual([
      ['2026-11-10', [1, 2]],
    ]);
  });
});

it('treats a pending answer as answered', () => {
  const asking = entry(1, at('2026-10-21', '19:00'), null, { asksForResponse: true });

  expect([owedIdsOf([asking], NOW, NONE), owedIdsOf([asking], NOW, new Map([[1, 'no']]))]).toEqual([
    [1],
    [],
  ]);
});

describe('leadEntryOf', () => {
  const entries = [
    entry(1, at('2026-10-19', '19:00'), at('2026-10-19', '21:00')),
    entry(2, at('2026-10-20', '11:00'), at('2026-10-20', '13:00'), { isRunning: true }),
    entry(3, at('2026-10-22', '19:00'), null),
    entry(4, at('2026-11-11', '11:11'), null),
  ];

  it.each([
    [null, 2],
    ['2026-10-21', 3],
    ['2026-11-01', 4],
    ['2027-01-01', null],
  ])('leads from %s with entry %s', (fromDay, id) => {
    expect(leadEntryOf(entries, NOW, fromDay)?.calendarEntryId ?? null).toBe(id);
  });
});
