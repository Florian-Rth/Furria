import { describe, expect, it } from 'vitest';
import type { CalendarEntry, CalendarPoll, CalendarSignUpList } from '@/features/calendar/schemas';
import { toDayTime } from '@/lib/day';
import {
  toAnnouncementAddOnMarks,
  toAnnouncementClosesAt,
  toAnnouncementPayload,
  toDiscardedAnnouncementAnswers,
  toOfferedAnnouncementAddOns,
} from './announcement-add-ons';
import type { AnnouncementAddOn, AnnouncementAddOnCardForm } from './schemas';

const poll: CalendarPoll = {
  pollId: 3,
  question: 'Welches Essen?',
  allowsMultipleChoices: false,
  isAnonymous: false,
  votesUntil: null,
  closedAt: null,
  closedByFirstName: null,
  closedByLastName: null,
  isClosed: false,
  voterCount: 4,
  concernedCount: 20,
  notAnswered: null,
  reminder: null,
  unassigned: null,
  options: [],
};

const list: CalendarSignUpList = {
  signUpListId: 5,
  title: 'Wer backt?',
  hint: null,
  signUpUntil: null,
  closedAt: null,
  closedByFirstName: null,
  closedByLastName: null,
  isClosed: false,
  lines: [
    { lineId: 1, personId: 8, firstName: 'Mara', lastName: 'Kurz', text: null, byViewer: false },
  ],
  concernedCount: 20,
  notAnswered: null,
  reminder: null,
};

const heldAddOns: AnnouncementAddOn[] = [
  {
    kind: 'attendance',
    attendance: {
      answersUntil: null,
      closedAt: null,
      closedByFirstName: null,
      closedByLastName: null,
      isClosed: false,
      yes: 2,
      maybe: 1,
      no: 3,
      concernedCount: 20,
      answers: [],
      notAnswered: null,
      reminder: null,
      unassigned: null,
    },
    borrowed: null,
  },
  { kind: 'poll', poll, borrowed: null },
  { kind: 'signUpList', signUpList: list, borrowed: null },
];

const attendanceCard: AnnouncementAddOnCardForm = {
  key: 'attendance',
  kind: 'attendance',
  attendance: { answersUntilDay: '', answersUntilTime: '', heldAnswersUntil: null },
};

describe('toOfferedAnnouncementAddOns', () => {
  it.each([
    ['a Zu-/Absage attached', [{ kind: 'attendance' }], ['poll', 'signUpList']],
    ['thirty attached', Array.from({ length: 30 }, () => ({ kind: 'poll' as const })), []],
  ] as const)('offers with %s', (_case, attached, expected) => {
    expect(toOfferedAnnouncementAddOns(attached)).toEqual(expected);
  });
});

describe('toDiscardedAnnouncementAnswers', () => {
  const pollForm = {
    question: 'Welches Essen?',
    allowsMultipleChoices: false,
    isAnonymous: false,
    votesUntilDay: '',
    votesUntilTime: '',
    heldVotesUntil: null,
    options: [],
  };

  it.each([
    ['the Zu-/Absage', attendanceCard, 6],
    ['a held poll', { key: 'poll-3', kind: 'poll', poll: { ...pollForm, pollId: 3 } }, 4],
    ['a new poll', { key: 'k1', kind: 'poll', poll: { ...pollForm, pollId: null } }, 0],
  ] as const)('loses the answers of %s', (_case, card, expected) => {
    expect(toDiscardedAnnouncementAnswers(card, { addOns: heldAddOns })).toBe(expected);
  });
});

describe('toAnnouncementClosesAt', () => {
  it.each([['2026-11-30', new Date(2026, 11, 1).toISOString()]] as const)(
    'closes an Aushang valid until %s at %s',
    (validUntil, expected) => {
      expect(toAnnouncementClosesAt(validUntil)).toBe(expected);
    },
  );
});

describe('toAnnouncementPayload', () => {
  it('sends the add-ons in their order, keeping an unchanged answer deadline', () => {
    const held = '2026-11-20T17:00:00.000Z';
    const { day, time } = toDayTime(held);

    expect(
      toAnnouncementPayload({
        title: 'Saalputz',
        body: 'Samstag',
        validUntil: '2026-11-30',
        notify: true,
        addOns: [
          {
            key: 'list',
            kind: 'signUpList',
            signUpList: {
              signUpListId: 5,
              title: ' Wer backt? ',
              hint: '',
              signUpUntilDay: '',
              signUpUntilTime: '',
              heldSignUpUntil: null,
            },
          },
          {
            key: 'attendance',
            kind: 'attendance',
            attendance: { answersUntilDay: day, answersUntilTime: time, heldAnswersUntil: held },
          },
          {
            key: 'borrowed-poll-9-4',
            kind: 'borrowed',
            borrowed: {
              lentKind: 'poll',
              calendarEntryId: 9,
              addOnId: 4,
              entryTitle: 'Umzug',
              entryStartsAt: '2026-11-21T13:00:00.000Z',
              name: 'Bus?',
            },
          },
        ],
      }),
    ).toEqual({
      title: 'Saalputz',
      body: 'Samstag',
      validUntil: '2026-11-30',
      addOns: [
        {
          kind: 'signUpList',
          attendance: null,
          poll: null,
          signUpList: { signUpListId: 5, title: 'Wer backt?', hint: null, signUpUntil: null },
          borrowed: null,
        },
        {
          kind: 'attendance',
          attendance: { answersUntil: held },
          poll: null,
          signUpList: null,
          borrowed: null,
        },
        {
          kind: 'poll',
          attendance: null,
          poll: null,
          signUpList: null,
          borrowed: { calendarEntryId: 9, addOnId: 4 },
        },
      ],
      notify: true,
    });
  });
});

describe('toAnnouncementAddOnMarks', () => {
  const entry: CalendarEntry = {
    calendarEntryId: 9,
    title: 'Stellprobe',
    startsAt: '2027-01-21T17:00:00Z',
    endsAt: null,
    kind: 'plain',
    venueId: null,
    venueName: null,
    ownerGroupId: null,
    ownerGroupName: null,
    ownerGroupTone: null,
    participatingGroups: [],
    audience: 'club',
    audienceGroups: [],
    audiencePeople: [],
    asksForResponse: true,
    addOns: [],
    openFunctions: [{ kind: 'poll', addOnId: 4, hasAnswered: false }],
    attendance: null,
    description: null,
    viewerAnswer: null,
    mayAnswer: true,
    isRunning: false,
    event: null,
  };
  const votedPoll: CalendarPoll = {
    ...poll,
    options: [{ optionId: 1, label: 'Pizza', voteCount: 1, viewerChose: true, voters: [] }],
  };
  const borrowed = (addOnId: number | null, lent: CalendarEntry): AnnouncementAddOn => ({
    kind: 'borrowed',
    lentKind: addOnId === null ? 'attendance' : 'poll',
    addOnId,
    entry: lent,
  });

  it.each<{
    label: string;
    addOns: AnnouncementAddOn[];
    viewerAnswer: 'yes' | null;
    viewerMayAnswer: boolean;
    expected: string[];
  }>([
    {
      label: 'a member who answered nothing',
      addOns: heldAddOns,
      viewerAnswer: null,
      viewerMayAnswer: true,
      expected: ['owed', 'owed', 'owed'],
    },
    {
      label: 'a reader who may not answer',
      addOns: heldAddOns,
      viewerAnswer: null,
      viewerMayAnswer: false,
      expected: ['quiet', 'quiet', 'quiet'],
    },
    {
      label: 'a closed poll she skipped and a closed one she voted in',
      addOns: [
        { kind: 'poll', poll: { ...poll, isClosed: true }, borrowed: null },
        { kind: 'poll', poll: { ...votedPoll, pollId: 8, isClosed: true }, borrowed: null },
      ],
      viewerAnswer: null,
      viewerMayAnswer: true,
      expected: ['closed', 'answered'],
    },
    {
      label: 'a taken-over poll she has not voted in',
      addOns: [borrowed(4, entry)],
      viewerAnswer: null,
      viewerMayAnswer: false,
      expected: ['owed'],
    },
    {
      label: 'a taken-over Zu-/Absage of an entry she may not answer',
      addOns: [borrowed(null, { ...entry, mayAnswer: false })],
      viewerAnswer: null,
      viewerMayAnswer: true,
      expected: ['quiet'],
    },
  ])('marks each add-on for $label', ({ addOns, viewerAnswer, viewerMayAnswer, expected }) => {
    expect(
      toAnnouncementAddOnMarks({ addOns, viewerAnswer, viewerMayAnswer }).map((mark) => mark.state),
    ).toEqual(expected);
  });
});
