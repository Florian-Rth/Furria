import { describe, expect, it } from 'vitest';
import {
  ADD_ON_LIMIT,
  toAttachedCards,
  toDiscardedAnswerCount,
  toOfferedAddOns,
} from './calendar-add-ons';
import type {
  CalendarAddOnCardForm,
  CalendarEntryAddOn,
  CalendarPoll,
  CalendarPollForm,
} from './schemas';

const counter = (): (() => string) => {
  let count = 0;

  return () => {
    count += 1;
    return `k${count}`;
  };
};

const heldPoll = (pollId: number, voterCount: number): CalendarPoll => ({
  pollId,
  question: 'Bus oder Bahn?',
  allowsMultipleChoices: false,
  isAnonymous: false,
  votesUntil: null,
  closedAt: null,
  isClosed: false,
  voterCount,
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

describe('toOfferedAddOns', () => {
  it.each([
    [[], ['attendance', 'participatingGroups', 'poll']],
    [[{ kind: 'participatingGroups' }], ['attendance', 'poll']],
    [[{ kind: 'attendance' }, { kind: 'participatingGroups' }], ['poll']],
    [
      [{ kind: 'poll' }, { kind: 'poll' }, { kind: 'attendance' }],
      ['participatingGroups', 'poll'],
    ],
  ] as const)('offers %j attached as %j', (attached, expected) => {
    expect(toOfferedAddOns(attached)).toEqual(expected);
  });

  it.each([
    [ADD_ON_LIMIT - 1, ['attendance', 'participatingGroups', 'poll']],
    [ADD_ON_LIMIT, []],
  ])('offers with %i polls attached %j', (count, expected) => {
    const attached = Array.from({ length: count }, () => ({ kind: 'poll' as const }));

    expect(toOfferedAddOns(attached)).toEqual(expected);
  });
});

describe('toAttachedCards', () => {
  const attendance: CalendarAddOnCardForm = { key: 'attendance', kind: 'attendance' };

  it.each([
    [[], 'attendance', ['attendance']],
    [[attendance], 'attendance', ['attendance']],
    [[attendance], 'participatingGroups', ['attendance', 'participatingGroups']],
    [[attendance], 'poll', ['attendance', 'poll']],
  ] as const)('attaches to %j the add-on %s as %j', (cards, kind, expected) => {
    const attached = toAttachedCards([...cards], kind, counter());

    expect(attached.map((card) => card.kind)).toEqual(expected);
  });

  it('gives every new poll and its two empty answers their own keys', () => {
    const next = counter();
    const cards = toAttachedCards(toAttachedCards([attendance], 'poll', next), 'poll', next);
    const keys = cards.flatMap((card) =>
      card.kind === 'poll'
        ? [card.key, ...card.poll.options.map((option) => option.key)]
        : [card.key],
    );
    const answers = cards.flatMap((card) =>
      card.kind === 'poll'
        ? card.poll.options.map((option) => [option.optionId, option.label])
        : [],
    );

    expect([keys.length, new Set(keys).size, answers]).toEqual([
      7,
      7,
      [
        [null, ''],
        [null, ''],
        [null, ''],
        [null, ''],
      ],
    ]);
  });
});

describe('toDiscardedAnswerCount', () => {
  const addOns: CalendarEntryAddOn[] = [
    { kind: 'attendance' },
    { kind: 'poll', poll: heldPoll(4, 6) },
  ];

  const cases: [string, CalendarAddOnCardForm, CalendarEntryAddOn[], number][] = [
    ['attendance on an entry asking', { key: 'attendance', kind: 'attendance' }, addOns, 4],
    ['attendance on an entry not asking', { key: 'attendance', kind: 'attendance' }, [], 0],
    [
      'participating groups',
      { key: 'participatingGroups', kind: 'participatingGroups' },
      addOns,
      0,
    ],
    ['a held poll', { key: 'poll-4', kind: 'poll', poll: { ...newPoll, pollId: 4 } }, addOns, 6],
    ['a new poll', { key: 'k1', kind: 'poll', poll: newPoll }, addOns, 0],
    [
      'a poll no longer held',
      { key: 'poll-8', kind: 'poll', poll: { ...newPoll, pollId: 8 } },
      addOns,
      0,
    ],
  ];

  it.each(cases)('discards for %s', (_case, card, held, expected) => {
    expect(toDiscardedAnswerCount(card, { addOns: held, responseCount: 4 })).toBe(expected);
  });

  it('discards nothing without a held entry', () => {
    expect(toDiscardedAnswerCount({ key: 'attendance', kind: 'attendance' }, null)).toBe(0);
  });
});
