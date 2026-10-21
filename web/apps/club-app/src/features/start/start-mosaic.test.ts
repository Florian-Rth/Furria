import { describe, expect, it } from 'vitest';
import type { Start, StartEntry, StartMine, StartPanel } from './schemas';
import { fittedCalendarCount, restSpansOf, toMosaic, weightOf } from './start-mosaic';

const mine = (kind: StartMine['kind']): StartMine => ({
  kind,
  subjectId: 1,
  on: '2026-10-17',
  until: '2026-10-30',
  name: 'Präsident',
  groupTone: null,
  function: null,
  changedBy: null,
  sessionStartYear: null,
  years: kind === 'milestone' ? 40 : null,
  permissionKeys: null,
});

const entry = (calendarEntryId: number): StartEntry => ({
  calendarEntryId,
  title: 'Training',
  kind: 'training',
  startsAt: '2026-10-20T18:00:00+02:00',
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
  event: null,
});

const startOf = (panels: StartPanel[]): Start => ({
  asOf: '2026-10-20T08:00:00+02:00',
  today: '2026-10-20',
  reshapeAt: null,
  viewerIsActiveInClub: true,
  panels,
});

const calendar: StartPanel & { kind: 'calendar' } = {
  kind: 'calendar',
  shownCount: 5,
  entries: [1, 2, 3, 4, 5, 6].map(entry),
};
const shortCalendar: StartPanel = { kind: 'calendar', shownCount: 5, entries: [entry(1)] };
const mineFacts: StartPanel = {
  kind: 'mine',
  shownCount: 3,
  mine: [mine('newKey'), mine('contactChangedByOther')],
};
const onlyMilestone: StartPanel = { kind: 'mine', shownCount: 3, mine: [mine('milestone')] };
const groups: StartPanel = {
  kind: 'groups',
  shownCount: 3,
  groupMoments: [
    {
      kind: 'jubilee',
      groupId: 1,
      name: 'Garde',
      tone: null,
      years: 25,
      foundedYear: 2001,
      until: '2026-10-30',
    },
  ],
};
const gallery: StartPanel = { kind: 'gallery', shownCount: 3, albums: [] };
const toDos: StartPanel = {
  kind: 'toDos',
  shownCount: 2,
  toDos: [
    { kind: 'neverInvited', count: 4 },
    { kind: 'reminderDue', count: 2 },
  ],
};

const oneSeat: StartPanel = { kind: 'mine', shownCount: 3, mine: [mine('newBoardSeat')] };
const fiveToDos: StartPanel = {
  kind: 'toDos',
  shownCount: 5,
  toDos: [
    { kind: 'neverInvited', count: 4 },
    { kind: 'reminderDue', count: 2 },
    { kind: 'inPersonOnly', count: 1 },
    { kind: 'birthDateUnknown', count: 3 },
    { kind: 'clubRecordGap', count: 2 },
  ],
};

const layoutOf = (start: Start) => {
  const mosaic = toMosaic(start);

  return {
    lead: mosaic.lead === null ? null : [mosaic.lead.kind, mosaic.lead.span.md],
    side: mosaic.side.map((tile) => tile.kind),
    rest: mosaic.rest.map((tile) => [tile.kind, tile.span.md]),
    orders: [mosaic.lead, ...mosaic.side, ...mosaic.rest].map((tile) => tile?.order ?? null),
  };
};

describe('weightOf', () => {
  it('weighs the calendar by the rows the server lets it show', () => {
    expect(weightOf(calendar)).toBeCloseTo(1 + 2 + 4 * 1.1 + 0.4);
  });

  it('counts mine facts without the milestone', () => {
    expect(weightOf(onlyMilestone)).toBe(1);
  });
});

describe('fittedCalendarCount', () => {
  it.each([
    { sideWeight: 2, shown: 3 },
    { sideWeight: 5.9, shown: 3 },
    { sideWeight: 7.1, shown: 4 },
    { sideWeight: 20, shown: 5 },
  ])('shows $shown entries beside a side of weight $sideWeight', ({ sideWeight, shown }) => {
    expect(fittedCalendarCount(calendar, sideWeight)).toBe(shown);
  });
});

describe('restSpansOf', () => {
  it.each([
    [0, []],
    [1, [12]],
    [2, [6, 6]],
    [3, [4, 4, 4]],
    [4, [6, 6, 6, 6]],
    [5, [4, 4, 4, 6, 6]],
  ])('fills full rows for %i tiles', (count, expected) => {
    expect(restSpansOf(count)).toEqual(expected);
  });
});

describe('toMosaic', () => {
  it('stacks tiles beside the calendar until they match its height', () => {
    expect(layoutOf(startOf([calendar, mineFacts, toDos, groups, gallery]))).toEqual({
      lead: ['calendar', 6],
      side: ['mine', 'toDos', 'groups'],
      rest: [['gallery', 12]],
      orders: [1, 2, 3, 4, 5],
    });
  });

  it('moves what a short calendar cannot balance into full rows below', () => {
    expect(layoutOf(startOf([shortCalendar, toDos, mineFacts, groups, gallery]))).toEqual({
      lead: ['calendar', 6],
      side: ['toDos', 'mine'],
      rest: [
        ['groups', 6],
        ['gallery', 6],
      ],
      orders: [1, 2, 3, 4, 5],
    });
  });

  it('widens the calendar when little sits beside it', () => {
    const mosaic = toMosaic(startOf([calendar, toDos]));

    expect([mosaic.lead?.span.md, mosaic.sideSpan.md]).toEqual([8, 4]);
  });

  it('shortens a wide calendar to the height of a light side', () => {
    const mosaic = toMosaic(startOf([calendar, fiveToDos, oneSeat]));

    expect([mosaic.lead?.span.md, mosaic.lead?.shownCount]).toEqual([8, 3]);
  });

  it('keeps the server count when the side balances the calendar', () => {
    const mosaic = toMosaic(startOf([calendar, mineFacts, toDos, groups, gallery]));

    expect(mosaic.lead?.shownCount).toBeNull();
  });

  it('gives a lone calendar the full width', () => {
    expect(layoutOf(startOf([calendar, onlyMilestone]))).toEqual({
      lead: ['calendar', 12],
      side: [],
      rest: [],
      orders: [1],
    });
  });

  it('lays out tiles without a calendar in full rows', () => {
    expect(layoutOf(startOf([mineFacts, groups, gallery]))).toEqual({
      lead: null,
      side: [],
      rest: [
        ['mine', 4],
        ['groups', 4],
        ['gallery', 4],
      ],
      orders: [null, 1, 2, 3],
    });
  });
});
