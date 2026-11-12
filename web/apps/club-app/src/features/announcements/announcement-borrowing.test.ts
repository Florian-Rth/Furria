import { describe, expect, it } from 'vitest';
import type { CalendarPoll } from '@/features/calendar/schemas';
import { toAnnouncementAddOnKey } from './announcement-add-ons';
import {
  toBorrowedAddOnKey,
  toBorrowedCards,
  toBorrowOptions,
  toLendableAddOns,
  toLentCalendarAddOn,
  toTickedBorrowings,
  withToggledKey,
} from './announcement-borrowing';
import type { AnnouncementAddOnCardForm } from './schemas';

const pollOf = (pollId: number, question: string): CalendarPoll => ({
  pollId,
  question,
  allowsMultipleChoices: false,
  isAnonymous: false,
  votesUntil: null,
  closedAt: null,
  closedByFirstName: null,
  closedByLastName: null,
  isClosed: false,
  voterCount: 0,
  concernedCount: 0,
  notAnswered: null,
  reminder: null,
  options: [],
});

describe('toLendableAddOns', () => {
  it.each([
    ['groups', ['attendance', 'poll']],
    ['club', ['attendance', 'poll']],
    ['people', []],
  ] as const)('offers what an entry for %s lends', (audience, kinds) => {
    const entry = {
      calendarEntryId: 9,
      title: 'Umzug',
      startsAt: '2026-11-21T13:00:00.000Z',
      audience,
      addOns: [
        { kind: 'attendance' as const },
        { kind: 'participatingGroups' as const },
        { kind: 'poll' as const, poll: pollOf(4, 'Bus?') },
      ],
    };

    expect(toLendableAddOns(entry).map((lent) => [lent.lentKind, lent.name])).toEqual(
      kinds.map((kind) => [kind, kind === 'poll' ? 'Bus?' : null]),
    );
  });
});

describe('toBorrowedCards', () => {
  it('appends only what is new and stops at the add-on limit', () => {
    const lendable = toLendableAddOns({
      calendarEntryId: 9,
      title: 'Umzug',
      startsAt: '2026-11-21T13:00:00.000Z',
      audience: 'club',
      addOns: [{ kind: 'attendance' }, { kind: 'poll', poll: pollOf(4, 'Bus?') }],
    });
    const nearlyFull: AnnouncementAddOnCardForm[] = Array.from({ length: 29 }, (_, index) => ({
      key: `held-${index}`,
      kind: 'attendance',
      attendance: { answersUntilDay: '', answersUntilTime: '', heldAnswersUntil: null },
    }));

    expect(toBorrowedCards(nearlyFull, lendable)).toHaveLength(30);
    expect(toBorrowedCards(toBorrowedCards([], lendable), lendable)).toHaveLength(2);
  });
});

describe('toBorrowedAddOnKey', () => {
  it('names a picked add-on as the server read names it after saving', () => {
    const entry = {
      calendarEntryId: 9,
      title: 'Umzug',
      startsAt: '2026-11-21T13:00:00+00:00',
      endsAt: null,
      kind: 'trip' as const,
      venueId: null,
      venueName: null,
      ownerGroupId: null,
      ownerGroupName: null,
      ownerGroupTone: null,
      participatingGroups: [],
      audience: 'club' as const,
      audienceGroups: [],
      audiencePeople: [],
      asksForResponse: true,
      addOns: [{ kind: 'attendance' as const }, { kind: 'poll' as const, poll: pollOf(4, 'Bus?') }],
      openFunctions: [],
      attendance: null,
      description: null,
      viewerAnswer: null,
      mayAnswer: true,
      isRunning: false,
      event: null,
    };

    expect(toLendableAddOns(entry).map(toBorrowedAddOnKey)).toEqual([
      toAnnouncementAddOnKey({ kind: 'borrowed', lentKind: 'attendance', addOnId: null, entry }),
      toAnnouncementAddOnKey({ kind: 'borrowed', lentKind: 'poll', addOnId: 4, entry }),
    ]);
  });
});

describe('toLentCalendarAddOn', () => {
  it.each([
    ['attendance', null, 'attendance'],
    ['poll', 4, 'poll'],
    ['poll', 5, null],
    ['signUpList', 4, null],
  ] as const)('finds the lent %s with id %s', (kind, addOnId, found) => {
    const entry = {
      addOns: [{ kind: 'attendance' as const }, { kind: 'poll' as const, poll: pollOf(4, 'Bus?') }],
    };

    expect(toLentCalendarAddOn(entry, kind, addOnId)?.kind ?? null).toEqual(found);
  });
});

describe('toBorrowOptions', () => {
  it('lists only entries that still lend something, opening the picked one', () => {
    const parade = {
      calendarEntryId: 9,
      title: 'Umzug',
      startsAt: '2026-11-21T13:00:00.000Z',
      audience: 'club' as const,
      addOns: [{ kind: 'attendance' as const }],
    };
    const meeting = { ...parade, calendarEntryId: 11, addOns: [] };
    const closedCircle = { ...parade, calendarEntryId: 12, audience: 'people' as const };
    const options = toBorrowOptions([parade, meeting, closedCircle], [], {
      pickedEntryId: 9,
      tickedKeys: new Set(),
    });

    expect(options.map((entry) => [entry.calendarEntryId, entry.addOns.length])).toEqual([[9, 1]]);
  });

  it('blocks further ticks once the announcement would be full', () => {
    const parade = {
      calendarEntryId: 9,
      title: 'Umzug',
      startsAt: '2026-11-21T13:00:00.000Z',
      audience: 'club' as const,
      addOns: [{ kind: 'attendance' as const }, { kind: 'poll' as const, poll: pollOf(4, 'Bus?') }],
    };
    const [attendance] = toLendableAddOns(parade).map(toBorrowedAddOnKey);
    const nearlyFull: AnnouncementAddOnCardForm[] = Array.from({ length: 29 }, (_, index) => ({
      key: `held-${index}`,
      kind: 'attendance',
      attendance: { answersUntilDay: '', answersUntilTime: '', heldAnswersUntil: null },
    }));
    const options = toBorrowOptions([parade], nearlyFull, {
      pickedEntryId: 9,
      tickedKeys: new Set(attendance === undefined ? [] : [attendance]),
    });

    expect(options.flatMap((entry) => entry.addOns.map((option) => option.isDisabled))).toEqual([
      false,
      true,
    ]);
    expect(toTickedBorrowings(options).map((borrowed) => borrowed.lentKind)).toEqual([
      'attendance',
    ]);
  });
});

describe('withToggledKey', () => {
  it.each([
    [[], ['a']],
    [['a'], []],
  ])('toggles a key in %j', (keys, expected) => {
    expect([...withToggledKey(new Set(keys), 'a')]).toEqual(expected);
  });
});
