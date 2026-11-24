import { describe, expect, it } from 'vitest';
import type { CalendarPoll } from '@/features/calendar/schemas';
import { toBorrowedCards, toLendableAddOns } from './announcement-borrowing';
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
  unassigned: null,
  options: [],
});

describe('toLendableAddOns', () => {
  it.each([
    ['groups', ['attendance', 'poll']],
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
