import { describe, expect, it } from 'vitest';
import type { Start, StartAnnouncement, StartEntry, StartPanel } from './schemas';
import type { StartItemRef, StartVisit } from './start-visit';
import { itemKeyOf, reconcileFrozenVisit, toStartVisit } from './start-visit';

const entry = (calendarEntryId: number, title: string): StartEntry => ({
  calendarEntryId,
  title,
  kind: 'training',
  startsAt: '2027-01-21T17:00:00Z',
  endsAt: null,
  isRunning: false,
  venue: null,
  viewerHoldsVenueKey: false,
  ownerGroup: null,
  participatingGroups: [],
  viewerGroupIds: [],
  viewerRuns: null,
  attendance: { viewerAnswer: null, isOwed: true },
  description: null,
});

const announcement = (announcementId: number, title: string): StartAnnouncement => ({
  announcementId,
  title,
  body: 'Abfahrt am Rathaus.',
  publishedAt: '2027-01-18T08:00:00Z',
  validUntil: null,
  author: {
    personId: 1,
    firstName: 'Karin',
    lastName: 'Albrecht',
    portrait: null,
    officeName: null,
  },
});

const start = (panels: StartPanel[], reshapeAt: string | null = null): Start => ({
  asOf: '2027-01-19T18:50:00Z',
  today: '2027-01-19',
  reshapeAt,
  viewerIsActiveInClub: true,
  panels,
});

const calendar = (entries: StartEntry[], shownCount = entries.length): StartPanel => ({
  kind: 'calendar',
  shownCount,
  entries,
});

const announcements = (items: StartAnnouncement[]): StartPanel => ({
  kind: 'announcements',
  shownCount: items.length,
  announcements: items,
});

const toDos = (count: number): StartPanel => ({
  kind: 'toDos',
  shownCount: 1,
  toDos: [{ kind: 'neverInvited', count }],
});

const visit = (frozen: Start, dimmed: string[] = []): StartVisit => ({
  start: frozen,
  dimmedKeys: new Set(dimmed),
});

describe('itemKeyOf', () => {
  it.each<{ ref: StartItemRef; expected: string }>([
    { ref: { panel: 'calendar', calendarEntryId: 811 }, expected: 'calendar:811' },
    {
      ref: { panel: 'mine', kind: 'membershipEnding', subjectId: null, on: '2027-01-31' },
      expected: 'mine:membershipEnding:0:2027-01-31',
    },
  ])('keys $ref.panel as $expected', ({ ref, expected }) => {
    expect(itemKeyOf(ref)).toBe(expected);
  });
});

describe('toStartVisit', () => {
  it('shows fresh data without dims', () => {
    const fresh = start([calendar([entry(1, 'Training')])]);

    expect(toStartVisit(fresh)).toEqual({ start: fresh, dimmedKeys: new Set() });
  });
});

describe('reconcileFrozenVisit', () => {
  it.each<{
    label: string;
    frozen: StartVisit;
    fresh: Start;
    touched: string[];
    expected: StartVisit;
  }>([
    {
      label: 'values change while the order holds',
      frozen: visit(start([calendar([entry(1, 'Training'), entry(2, 'Stellprobe')])])),
      fresh: start([calendar([entry(2, 'Stellprobe'), entry(1, 'Training fällt aus')])]),
      touched: [],
      expected: visit(start([calendar([entry(1, 'Training fällt aus'), entry(2, 'Stellprobe')])])),
    },
    {
      label: 'an untouched entry left the board',
      frozen: visit(start([calendar([entry(1, 'Training'), entry(2, 'Stellprobe')])])),
      fresh: start([calendar([entry(2, 'Stellprobe')])]),
      touched: [],
      expected: visit(start([calendar([entry(1, 'Training'), entry(2, 'Stellprobe')])]), [
        'calendar:1',
      ]),
    },
    {
      label: 'the entry she answered left the board',
      frozen: visit(start([calendar([entry(1, 'Training'), entry(2, 'Stellprobe')])])),
      fresh: start([calendar([entry(2, 'Stellprobe')])]),
      touched: ['calendar:1'],
      expected: visit(start([calendar([entry(1, 'Training'), entry(2, 'Stellprobe')])])),
    },
    {
      label: 'a new entry arrived mid-visit',
      frozen: visit(start([calendar([entry(1, 'Training')])])),
      fresh: start([calendar([entry(3, 'Generalprobe'), entry(1, 'Training')], 2)]),
      touched: [],
      expected: visit(start([calendar([entry(1, 'Training')])])),
    },
    {
      label: 'a dimmed entry came back',
      frozen: visit(start([calendar([entry(1, 'Training')])]), ['calendar:1']),
      fresh: start([calendar([entry(1, 'Training')])]),
      touched: [],
      expected: visit(start([calendar([entry(1, 'Training')])])),
    },
    {
      label: 'the panels swapped ranks and a new panel arrived',
      frozen: visit(
        start([calendar([entry(1, 'Training')]), announcements([announcement(19, 'Busfahrt')])]),
      ),
      fresh: start([
        toDos(47),
        announcements([announcement(19, 'Busfahrt zum Umzug')]),
        calendar([entry(1, 'Training')]),
      ]),
      touched: [],
      expected: visit(
        start([
          calendar([entry(1, 'Training')]),
          announcements([announcement(19, 'Busfahrt zum Umzug')]),
        ]),
      ),
    },
    {
      label: 'the read announcements left after their sheet was opened',
      frozen: visit(
        start([calendar([entry(1, 'Training')]), announcements([announcement(19, 'Busfahrt')])]),
      ),
      fresh: start([calendar([entry(1, 'Training')])], '2027-01-19T21:00:00Z'),
      touched: [],
      expected: visit(
        start(
          [calendar([entry(1, 'Training')]), announcements([announcement(19, 'Busfahrt')])],
          '2027-01-19T21:00:00Z',
        ),
        ['announcements:19'],
      ),
    },
    {
      label: 'the panel grew past its cap',
      frozen: visit(start([calendar([entry(1, 'Training'), entry(2, 'Stellprobe')], 1)])),
      fresh: start([calendar([entry(1, 'Training'), entry(2, 'Stellprobe'), entry(3, 'Ball')], 3)]),
      touched: [],
      expected: visit(start([calendar([entry(1, 'Training'), entry(2, 'Stellprobe')], 1)])),
    },
  ])('holds the visit when $label', ({ frozen, fresh, touched, expected }) => {
    expect(reconcileFrozenVisit(frozen, fresh, new Set(touched))).toEqual(expected);
  });
});
