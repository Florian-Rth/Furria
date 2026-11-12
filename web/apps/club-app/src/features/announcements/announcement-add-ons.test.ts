import { describe, expect, it } from 'vitest';
import type { CalendarPoll, CalendarSignUpList } from '@/features/calendar/schemas';
import { toDayTime } from '@/lib/day';
import {
  toAnnouncementAddOnKind,
  toAnnouncementClosesAt,
  toAnnouncementPayload,
  toAnswersUntilPaths,
  toAttachedAnnouncementCards,
  toDiscardedAnnouncementAnswers,
  toOfferedAnnouncementAddOns,
  withAnswersUntilDay,
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
    },
  },
  { kind: 'poll', poll },
  { kind: 'signUpList', signUpList: list },
];

const attendanceCard: AnnouncementAddOnCardForm = {
  key: 'attendance',
  kind: 'attendance',
  attendance: { answersUntilDay: '', answersUntilTime: '', heldAnswersUntil: null },
};

const keys = (): (() => string) => {
  let count = 0;

  return () => {
    count += 1;

    return `k${count}`;
  };
};

describe('toAnnouncementAddOnKind', () => {
  it.each([
    ['attendance', 'attendance'],
    ['poll', 'poll'],
    ['signUpList', 'signUpList'],
    ['daySchedule', null],
    ['participatingGroups', null],
  ] as const)('takes %s as %s', (kind, expected) => {
    expect(toAnnouncementAddOnKind(kind)).toBe(expected);
  });
});

describe('toOfferedAnnouncementAddOns', () => {
  it.each([
    ['nothing attached', [], ['attendance', 'poll', 'signUpList']],
    ['a Zu-/Absage attached', [{ kind: 'attendance' }], ['poll', 'signUpList']],
    ['a poll attached', [{ kind: 'poll' }], ['attendance', 'poll', 'signUpList']],
    ['thirty attached', Array.from({ length: 30 }, () => ({ kind: 'poll' as const })), []],
  ] as const)('offers with %s', (_case, attached, expected) => {
    expect(toOfferedAnnouncementAddOns(attached)).toEqual(expected);
  });
});

describe('toAttachedAnnouncementCards', () => {
  it('attaches one Zu-/Absage only', () => {
    const once = toAttachedAnnouncementCards([], 'attendance', keys());

    expect([once, toAttachedAnnouncementCards(once, 'attendance', keys())]).toEqual([
      [attendanceCard],
      [attendanceCard],
    ]);
  });

  it('adds every poll and list under a fresh key', () => {
    const nextKey = keys();
    const cards = toAttachedAnnouncementCards(
      toAttachedAnnouncementCards([], 'poll', nextKey),
      'signUpList',
      nextKey,
    );
    const cardKeys = cards.map((card) => card.key);

    expect(new Set(cardKeys).size).toBe(2);
  });
});

describe('toAnswersUntilPaths', () => {
  it('rechecks the Zu-/Absage deadline at its position', () => {
    expect(toAnswersUntilPaths([{ kind: 'poll' }, { kind: 'attendance' }])).toEqual([
      'addOns.1.attendance.answersUntilTime',
    ]);
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
  const listForm = {
    title: 'Wer backt?',
    hint: '',
    signUpUntilDay: '',
    signUpUntilTime: '',
    heldSignUpUntil: null,
  };

  it.each([
    ['the Zu-/Absage', attendanceCard, 6],
    ['a held poll', { key: 'poll-3', kind: 'poll', poll: { ...pollForm, pollId: 3 } }, 4],
    [
      'a held list',
      { key: 'sign-up-list-5', kind: 'signUpList', signUpList: { ...listForm, signUpListId: 5 } },
      1,
    ],
    ['a new poll', { key: 'k1', kind: 'poll', poll: { ...pollForm, pollId: null } }, 0],
  ] as const)('loses the answers of %s', (_case, card, expected) => {
    expect(toDiscardedAnnouncementAnswers(card, { addOns: heldAddOns })).toBe(expected);
  });

  it('loses nothing on a new Aushang', () => {
    expect(toDiscardedAnnouncementAnswers(attendanceCard, null)).toBe(0);
  });
});

describe('withAnswersUntilDay', () => {
  it.each([
    ['a day without a time', '2026-11-20', '', { day: '2026-11-20', time: '20:00' }],
    ['a day with a time', '2026-11-21', '18:30', { day: '2026-11-21', time: '18:30' }],
    ['no day', null, '18:30', { day: '', time: '' }],
  ] as const)('picks %s', (_case, day, time, expected) => {
    const changed = withAnswersUntilDay(
      { answersUntilDay: '2026-11-19', answersUntilTime: time, heldAnswersUntil: null },
      day,
    );

    expect({ day: changed.answersUntilDay, time: changed.answersUntilTime }).toEqual(expected);
  });
});

describe('toAnnouncementClosesAt', () => {
  it.each([
    [null, null],
    ['2026-11-30', new Date(2026, 11, 1).toISOString()],
  ] as const)('closes an Aushang valid until %s at %s', (validUntil, expected) => {
    expect(toAnnouncementClosesAt(validUntil)).toBe(expected);
  });
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
        },
        { kind: 'attendance', attendance: { answersUntil: held }, poll: null, signUpList: null },
      ],
    });
  });
});
