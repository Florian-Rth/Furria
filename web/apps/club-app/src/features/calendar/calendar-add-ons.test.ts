import { describe, expect, it } from 'vitest';
import { ADD_ON_LIMIT, toDiscardedAnswerCount, toOfferedAddOns } from './calendar-add-ons';
import type {
  CalendarAddOnCardForm,
  CalendarEntryAddOn,
  CalendarPoll,
  CalendarPollForm,
  CalendarSignUpList,
  CalendarSignUpListForm,
} from './schemas';

const heldPoll = (pollId: number, voterCount: number): CalendarPoll => ({
  pollId,
  question: 'Bus oder Bahn?',
  allowsMultipleChoices: false,
  isAnonymous: false,
  votesUntil: null,
  closedAt: null,
  closedByFirstName: null,
  closedByLastName: null,
  isClosed: false,
  voterCount,
  concernedCount: null,
  notAnswered: null,
  reminder: null,
  unassigned: null,
  options: [],
});

const newPoll: CalendarPollForm = {
  pollId: null,
  question: '',
  allowsMultipleChoices: false,
  isAnonymous: false,
  votesUntilDay: '',
  votesUntilTime: '',
  heldVotesUntil: null,
  options: [],
};

const heldList = (signUpListId: number, lineCount: number): CalendarSignUpList => ({
  signUpListId,
  title: 'Wer bringt was?',
  hint: null,
  signUpUntil: null,
  closedAt: null,
  closedByFirstName: null,
  closedByLastName: null,
  isClosed: false,
  lines: Array.from({ length: lineCount }, (_, index) => ({
    lineId: index + 1,
    personId: index + 1,
    firstName: 'Anna',
    lastName: 'Bauer',
    text: null,
    byViewer: false,
  })),
  concernedCount: null,
  notAnswered: null,
  reminder: null,
});

const newList: CalendarSignUpListForm = {
  signUpListId: null,
  title: '',
  hint: '',
  signUpUntilDay: '',
  signUpUntilTime: '',
  heldSignUpUntil: null,
};

describe('toOfferedAddOns', () => {
  it.each([
    [
      [{ kind: 'attendance' }, { kind: 'participatingGroups' }],
      ['poll', 'signUpList', 'daySchedule'],
    ],
    [
      [{ kind: 'poll' }, { kind: 'signUpList' }, { kind: 'daySchedule' }, { kind: 'attendance' }],
      ['participatingGroups', 'poll', 'signUpList', 'daySchedule'],
    ],
  ] as const)('offers %j attached as %j', (attached, expected) => {
    expect(toOfferedAddOns(attached)).toEqual(expected);
  });

  it.each([[ADD_ON_LIMIT, []]])('offers with %i polls attached %j', (count, expected) => {
    const attached = Array.from({ length: count }, () => ({ kind: 'poll' as const }));

    expect(toOfferedAddOns(attached)).toEqual(expected);
  });
});

describe('toDiscardedAnswerCount', () => {
  const addOns: CalendarEntryAddOn[] = [
    { kind: 'attendance' },
    { kind: 'poll', poll: heldPoll(4, 6) },
    { kind: 'signUpList', signUpList: heldList(7, 3) },
  ];

  const cases: [string, CalendarAddOnCardForm, CalendarEntryAddOn[], number][] = [
    ['attendance on an entry asking', { key: 'attendance', kind: 'attendance' }, addOns, 4],
    ['attendance on an entry not asking', { key: 'attendance', kind: 'attendance' }, [], 0],
    ['a held poll', { key: 'poll-4', kind: 'poll', poll: { ...newPoll, pollId: 4 } }, addOns, 6],
    [
      'a poll no longer held',
      { key: 'poll-8', kind: 'poll', poll: { ...newPoll, pollId: 8 } },
      addOns,
      0,
    ],
    [
      'a held sign-up list',
      { key: 'sign-up-list-7', kind: 'signUpList', signUpList: { ...newList, signUpListId: 7 } },
      addOns,
      3,
    ],
  ];

  it.each(cases)('discards for %s', (_case, card, held, expected) => {
    expect(
      toDiscardedAnswerCount(card, { addOns: held, attendance: { yes: 2, maybe: 1, no: 1 } }),
    ).toBe(expected);
  });
});
