import { describe, expect, it } from 'vitest';
import { toCalendarEntrySheet } from './calendar-entry-sheet';
import type { CalendarEntry, CalendarEventFacts } from './schemas';

const facts = (overrides: Partial<CalendarEventFacts>): CalendarEventFacts => ({
  doorsOpenAt: null,
  teaser: 'Der Saal ist geschmückt.',
  ageHint: null,
  priceCents: null,
  presaleStartsAt: null,
  status: 'available',
  picture: null,
  ...overrides,
});

const entry = (overrides: Partial<CalendarEntry>): CalendarEntry => ({
  calendarEntryId: 7,
  title: 'Prunksitzung',
  startsAt: '2027-01-23T18:11:00.000Z',
  endsAt: null,
  kind: 'event',
  venueId: null,
  venueName: null,
  ownerGroupId: 3,
  ownerGroupName: 'Garde',
  ownerGroupTone: null,
  participatingGroups: [
    { groupId: 3, name: 'Garde', tone: null },
    { groupId: 5, name: 'Elferrat', tone: null },
  ],
  visibility: 'public',
  asksForResponse: false,
  description: null,
  viewerAnswer: null,
  isRunning: false,
  event: facts({}),
  ...overrides,
});

const PICTURE = { smallUrl: '/s', mediumUrl: '/m', largeUrl: '/l' };

describe('toCalendarEntrySheet', () => {
  it.each([
    ['an event for its keeper', entry({}), true, '/events/$eventId'],
    ['an event for a member', entry({}), false, null],
    ['a meeting for an event keeper', entry({ kind: 'meeting', event: null }), true, null],
  ] as const)('offers editing on %s', (_, subject, managesEvents, to) => {
    expect(toCalendarEntrySheet(subject, managesEvents, null).primary?.to ?? null).toBe(to);
  });

  it.each([
    ['an event with a picture', entry({ event: facts({ picture: PICTURE }) }), true, '/m'],
    ['an event without a picture', entry({}), true, null],
    ['a meeting', entry({ kind: 'meeting', event: null }), false, null],
  ] as const)('opens %s with its picture', (_, subject, hasCover, src) => {
    const { cover } = toCalendarEntrySheet(subject, false, null);

    expect(cover !== null).toBe(hasCover);
    expect(cover?.image?.src ?? null).toBe(src);
  });

  it.each([
    ['a cancelled event', 'cancelled', true],
    ['an event on sale', 'available', false],
  ] as const)('stamps %s', (_, status, stamped) => {
    const { cover } = toCalendarEntrySheet(entry({ event: facts({ status }) }), false, null);

    expect(cover?.cancelledLabel != null).toBe(stamped);
  });

  it('lists the participating groups without the owner', () => {
    const { participating } = toCalendarEntrySheet(entry({}), false, null);

    expect(participating.map((group) => group.groupId)).toEqual([5]);
  });
});
