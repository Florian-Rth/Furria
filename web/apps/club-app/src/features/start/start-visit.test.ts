import { describe, expect, it } from 'vitest';
import type {
  Start,
  StartAnnouncement,
  StartAnnouncementAddOns,
  StartEntry,
  StartPanel,
} from './schemas';
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
  audience: 'club',
  audienceGroups: [],
  viewerGroupIds: [],
  viewerRuns: null,
  attendance: { viewerAnswer: null, isOwed: true },
  openPolls: [],
  openSignUpLists: [],
  description: null,
  event: null,
});

const announcement = (announcementId: number, title: string): StartAnnouncement => ({
  announcementId,
  title,
  body: 'Abfahrt am Rathaus.',
  mentions: { persons: [], groups: [], calendarEntries: [], events: [], newsPosts: [], albums: [] },
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
  announcementAddOns: [],
});

const announcements = (items: StartAnnouncement[]): StartPanel => ({
  kind: 'announcements',
  shownCount: items.length,
  announcements: items,
});

const toDos = (count: number): StartPanel => ({
  kind: 'toDos',
  shownCount: 1,
  toDos: [{ kind: 'neverInvited', count, group: null }],
});

const visit = (frozen: Start, dimmed: string[] = []): StartVisit => ({
  start: frozen,
  dimmedKeys: new Set(dimmed),
});

describe('itemKeyOf', () => {
  it.each<{ ref: StartItemRef; expected: string }>([
    { ref: { panel: 'calendar', calendarEntryId: 811 }, expected: 'calendar:811' },
    {
      ref: { panel: 'announcementAddOns', announcementId: 5 },
      expected: 'announcementAddOns:5',
    },
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

describe('reconcileFrozenVisit with announcement add-ons', () => {
  const festival = (isOwed: boolean): StartAnnouncementAddOns => ({
    announcementId: 5,
    title: 'Sommerfest',
    publishedAt: '2027-01-18T09:00:00Z',
    attendance: { position: 0, viewerAnswer: isOwed ? null : 'yes', isOwed },
    openPolls: [],
    openSignUpLists: [],
  });
  const withAddOns = (addOns: StartAnnouncementAddOns[]): StartPanel => ({
    kind: 'calendar',
    shownCount: 0,
    entries: [],
    announcementAddOns: addOns,
  });
  const frozen = visit(start([withAddOns([festival(true)])]));

  it('takes her fresh answer', () => {
    expect(reconcileFrozenVisit(frozen, start([withAddOns([festival(false)])]), new Set())).toEqual(
      visit(start([withAddOns([festival(false)])])),
    );
  });

  it.each<{ touched: string[]; expected: string[] }>([
    { touched: [], expected: ['announcementAddOns:5'] },
    { touched: ['announcementAddOns:5'], expected: [] },
  ])('dims an announcement that left unless touched: $touched', ({ touched, expected }) => {
    expect(reconcileFrozenVisit(frozen, start([]), new Set(touched)).dimmedKeys).toEqual(
      new Set(expected),
    );
  });
});
