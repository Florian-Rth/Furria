import { describe, expect, it } from 'vitest';
import type {
  Start,
  StartAnnouncement,
  StartEntry,
  StartGroupMoment,
  StartMine,
  StartPanel,
} from './schemas';
import type { StartScreenInput, VisitHold } from './start-board';
import {
  byStartsAt,
  hiddenCountOf,
  isVisitOver,
  nextVisitHold,
  openVisitHold,
  sheetHeldVisitHold,
  startScreenOf,
  toCalendarRows,
  toShownCount,
  touchedVisitHold,
  withoutQuiet,
} from './start-board';
import type { QuietMemory } from './start-quiet';

const entry = (calendarEntryId: number, startsAt: string): StartEntry => ({
  calendarEntryId,
  title: 'Training',
  kind: 'training',
  startsAt,
  endsAt: null,
  isRunning: false,
  venue: null,
  viewerHoldsVenueKey: false,
  ownerGroup: null,
  participatingGroups: [],
  viewerGroupIds: [],
  viewerRuns: null,
  attendance: null,
  description: null,
});

const mine = (subjectId: number, until = '2027-01-30'): StartMine => ({
  kind: 'newGroupMembership',
  subjectId,
  on: '2027-01-17',
  until,
  name: 'Tanzgarde',
  groupTone: 'rose',
  function: null,
  changedBy: null,
  sessionStartYear: null,
  years: null,
  permissionKeys: null,
});

const jubilee = (groupId: number): StartGroupMoment => ({
  kind: 'jubilee',
  groupId,
  name: 'Kindergarde',
  tone: 'teal',
  years: 25,
  foundedYear: 2001,
  until: '2026-11-24',
});

const start = (panels: StartPanel[], overrides: Partial<Start> = {}): Start => ({
  asOf: '2027-01-19T18:50:00Z',
  today: '2027-01-19',
  reshapeAt: null,
  viewerIsActiveInClub: true,
  panels,
  ...overrides,
});

const calendar = (entries: StartEntry[], shownCount = entries.length): StartPanel => ({
  kind: 'calendar',
  shownCount,
  entries,
});

const minePanel = (items: StartMine[], shownCount = items.length): StartPanel => ({
  kind: 'mine',
  shownCount,
  mine: items,
});

const quiet = (items: Record<string, string>): QuietMemory => ({ v: 1, items });

const NONE: ReadonlySet<string> = new Set();

describe('startScreenOf', () => {
  const board = start([calendar([entry(1, '2027-01-21T17:00:00Z')])]);

  it.each<{ label: string; input: StartScreenInput; expected: string }>([
    {
      label: 'the visit holds panels',
      input: { start: board, failed: true, paused: true, skeletonDue: true },
      expected: 'board',
    },
    {
      label: 'the viewer is not active in the club',
      input: {
        start: start([], { viewerIsActiveInClub: false }),
        failed: false,
        paused: false,
        skeletonDue: false,
      },
      expected: 'inactive',
    },
    {
      label: 'the active viewer has no panels',
      input: { start: start([]), failed: false, paused: false, skeletonDue: false },
      expected: 'empty',
    },
    {
      label: 'the first load failed',
      input: { start: null, failed: true, paused: true, skeletonDue: true },
      expected: 'error',
    },
    {
      label: 'the first load waits for the network',
      input: { start: null, failed: false, paused: true, skeletonDue: true },
      expected: 'offline',
    },
    {
      label: 'the first load runs past the skeleton delay',
      input: { start: null, failed: false, paused: false, skeletonDue: true },
      expected: 'skeleton',
    },
    {
      label: 'the first load is still young',
      input: { start: null, failed: false, paused: false, skeletonDue: false },
      expected: 'waiting',
    },
  ])('shows $expected when $label', ({ input, expected }) => {
    expect(startScreenOf(input).kind).toBe(expected);
  });
});

describe('toShownCount', () => {
  it.each([
    { shownCount: 3, total: 5, expected: 3 },
    { shownCount: 3, total: 4, expected: 4 },
    { shownCount: 4, total: 2, expected: 2 },
  ])(
    'shows $expected of $total when the server shows $shownCount',
    ({ shownCount, total, expected }) => {
      expect(toShownCount(shownCount, total)).toBe(expected);
    },
  );
});

describe('hiddenCountOf', () => {
  it.each([
    { shownCount: 5, total: 7, expected: 2 },
    { shownCount: 6, total: 5, expected: 0 },
  ])('hides $expected of $total', ({ shownCount, total, expected }) => {
    const entries = Array.from({ length: total }, (_, index) =>
      entry(index + 1, '2027-01-21T17:00:00Z'),
    );

    expect(hiddenCountOf(calendar(entries, shownCount))).toBe(expected);
  });
});

describe('withoutQuiet', () => {
  it('drops a quieted DU line and shows the rest in full', () => {
    const board = start([minePanel([mine(4), mine(5), mine(6), mine(7)], 4)]);
    const memory = quiet({ 'mine:newGroupMembership:5:2027-01-17': '2027-01-30' });

    const [panel] = withoutQuiet(board, memory, NONE).panels;

    expect(panel?.kind === 'mine' && panel.mine.map((item) => item.subjectId)).toEqual([4, 6, 7]);
    expect(panel?.shownCount).toBe(3);
  });

  it('keeps a quieted line she touched this visit', () => {
    const key = 'mine:newGroupMembership:5:2027-01-17';
    const board = start([minePanel([mine(5)])]);

    const [panel] = withoutQuiet(board, quiet({ [key]: '2027-01-30' }), new Set([key])).panels;

    expect(panel?.kind === 'mine' && panel.mine).toHaveLength(1);
  });

  it('drops a GRUPPEN panel whose only moment is quiet', () => {
    const board = start([
      calendar([entry(1, '2027-01-21T17:00:00Z')]),
      { kind: 'groups', shownCount: 1, groupMoments: [jubilee(6)] },
    ]);

    const result = withoutQuiet(board, quiet({ 'groups:jubilee:6': '2027-01-30' }), NONE);

    expect(result.panels.map((panel) => panel.kind)).toEqual(['calendar']);
  });

  it('leaves calendar lines alone whatever the memory says', () => {
    const board = start([calendar([entry(1, '2027-01-21T17:00:00Z')])]);

    const result = withoutQuiet(board, quiet({ 'calendar:1': '2027-01-30' }), NONE);

    expect(result.panels).toHaveLength(1);
  });
});

describe('toCalendarRows', () => {
  it('hands each line the start of the line above and its dimming', () => {
    const first = entry(1, '2027-01-21T17:00:00Z');
    const second = entry(2, '2027-01-22T17:30:00Z');

    expect(toCalendarRows([first, second], new Set(['calendar:2']))).toEqual([
      { entry: first, previousStartsAt: null, dimmed: false },
      { entry: second, previousStartsAt: first.startsAt, dimmed: true },
    ]);
  });
});

describe('byStartsAt', () => {
  it('orders by start and then by id', () => {
    const late = entry(3, '2027-01-22T17:00:00Z');
    const early = entry(9, '2027-01-21T17:00:00Z');
    const twin = entry(4, '2027-01-21T17:00:00Z');

    expect(byStartsAt([late, early, twin]).map((item) => item.calendarEntryId)).toEqual([4, 9, 3]);
  });
});

describe('isVisitOver', () => {
  const hiddenAt = Date.parse('2027-01-19T18:00:00Z');

  it.each([
    { minutes: 9, expected: false },
    { minutes: 10, expected: true },
  ])('ends the visit after $minutes minutes away: $expected', ({ minutes, expected }) => {
    expect(isVisitOver(hiddenAt, hiddenAt + minutes * 60_000)).toBe(expected);
  });
});

describe('visit hold', () => {
  const first = start([calendar([entry(1, '2027-01-21T17:00:00Z')])]);
  const fresh = start([calendar([entry(2, '2027-01-22T17:00:00Z')])]);

  it('replaces the view with fresh data before her first touch', () => {
    const hold = nextVisitHold(openVisitHold(first), fresh);

    expect(hold.visit?.start).toBe(fresh);
  });

  it('keeps the frozen order and dims what left after her first touch', () => {
    const frozen: VisitHold = { ...openVisitHold(first), frozen: true };

    const hold = nextVisitHold(frozen, fresh);

    expect(hold.visit?.start.panels).toEqual(first.panels);
    expect([...(hold.visit?.dimmedKeys ?? [])]).toEqual(['calendar:1']);
  });

  it('keeps the visit when the data goes away', () => {
    const opened = openVisitHold(first);

    expect(nextVisitHold(opened, undefined).visit).toBe(opened.visit);
  });

  it('freezes the visit and remembers the touched line', () => {
    const hold = touchedVisitHold(openVisitHold(first), 'calendar:1');

    expect(hold.frozen).toBe(true);
    expect(hold.touched.has('calendar:1')).toBe(true);
  });

  it.each([
    { label: 'an open sheet freezes a live visit', sheetOpen: true, data: true, frozen: true },
    { label: 'a closed sheet leaves it live', sheetOpen: false, data: true, frozen: false },
    { label: 'an open sheet waits for data', sheetOpen: true, data: false, frozen: false },
  ])('$label', ({ sheetOpen, data, frozen }) => {
    const hold = openVisitHold(data ? first : undefined);

    expect(sheetHeldVisitHold(hold, sheetOpen).frozen).toBe(frozen);
  });

  it('keeps the Aushänge she is reading when marking them seen empties the panel', () => {
    const announcement: StartAnnouncement = {
      announcementId: 7,
      title: 'Helfer gesucht',
      body: 'Wer hilft beim Hallenaufbau?',
      publishedAt: '2027-01-18T09:00:00Z',
      validUntil: null,
      author: {
        personId: 3,
        firstName: 'Frank',
        lastName: 'Weber',
        portraitUrl: null,
        officeName: 'Präsident',
      },
    };
    const reading = start([
      calendar([entry(1, '2027-01-21T17:00:00Z')]),
      { kind: 'announcements', shownCount: 1, announcements: [announcement] },
    ]);
    const seen = start([calendar([entry(1, '2027-01-21T17:00:00Z')])]);

    const hold = nextVisitHold(sheetHeldVisitHold(openVisitHold(reading), true), seen);

    expect(hold.visit?.start.panels.map((panel) => panel.kind)).toEqual([
      'calendar',
      'announcements',
    ]);
  });
});
