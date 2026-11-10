import { describe, expect, it } from 'vitest';
import { toInstant } from '@/lib/day';
import type { CalendarPollIssueCode } from './calendar-polls';
import {
  toPollForm,
  toPollFormLocks,
  toPollIssues,
  toPollPayload,
  toPollResults,
  toViewerChoice,
  toVoteSet,
  withVotesUntilDay,
} from './calendar-polls';
import type {
  CalendarAddOnCardForm,
  CalendarPoll,
  CalendarPollForm,
  CalendarPollOption,
} from './schemas';

const option = (optionId: number, voteCount: number, viewerChose = false): CalendarPollOption => ({
  optionId,
  label: `Antwort ${optionId}`,
  voteCount,
  viewerChose,
  voters: [],
});

const poll = (overrides: Partial<CalendarPoll>): CalendarPoll => ({
  pollId: 4,
  question: 'Bus oder Bahn?',
  allowsMultipleChoices: false,
  isAnonymous: false,
  votesUntil: null,
  closedAt: null,
  isClosed: false,
  voterCount: 0,
  options: [option(1, 0), option(2, 0)],
  ...overrides,
});

const pollForm = (overrides: Partial<CalendarPollForm>): CalendarPollForm => ({
  pollId: null,
  question: 'Bus oder Bahn?',
  allowsMultipleChoices: false,
  isAnonymous: false,
  votesUntilDay: '',
  votesUntilTime: '',
  heldVotesUntil: null,
  options: [
    { key: 'a', optionId: null, label: 'Bus' },
    { key: 'b', optionId: null, label: 'Bahn' },
  ],
  ...overrides,
});

const START = { day: '2027-02-10', time: '19:00' };

const labels = (...values: string[]): CalendarPollForm['options'] =>
  values.map((label, index) => ({ key: `o${index}`, optionId: null, label }));

describe('toPollIssues', () => {
  it.each<[string, Partial<CalendarPollForm>, [CalendarPollIssueCode, (string | number)[]][]]>([
    ['a complete poll', {}, []],
    [
      'a blank question',
      { question: '   ' },
      [['questionMissing', ['addOns', 1, 'poll', 'question']]],
    ],
    [
      'a too long question',
      { question: 'x'.repeat(201) },
      [['questionTooLong', ['addOns', 1, 'poll', 'question']]],
    ],
    [
      'a blank answer',
      { options: labels('Bus', ' ') },
      [['optionMissing', ['addOns', 1, 'poll', 'options', 1, 'label']]],
    ],
    [
      'a too long answer',
      { options: labels('Bus', 'x'.repeat(121)) },
      [['optionTooLong', ['addOns', 1, 'poll', 'options', 1, 'label']]],
    ],
    [
      'a repeated answer differing in case and spaces',
      { options: labels('Bus', 'Bahn', ' bus ') },
      [['optionRepeated', ['addOns', 1, 'poll', 'options', 2, 'label']]],
    ],
    [
      'a deadline day without time',
      { votesUntilDay: '2027-02-09' },
      [['deadlineTimeMissing', ['addOns', 1, 'poll', 'votesUntilTime']]],
    ],
    [
      'a deadline after the start',
      { votesUntilDay: '2027-02-10', votesUntilTime: '19:01' },
      [['deadlineAfterStart', ['addOns', 1, 'poll', 'votesUntilTime']]],
    ],
    ['a deadline right at the start', { votesUntilDay: '2027-02-10', votesUntilTime: '19:00' }, []],
  ])('finds for %s', (_case, overrides, expected) => {
    const cards: CalendarAddOnCardForm[] = [
      { key: 'attendance', kind: 'attendance' },
      { key: 'p', kind: 'poll', poll: pollForm(overrides) },
    ];

    expect(toPollIssues(cards, START).map((issue) => [issue.code, issue.path])).toEqual(expected);
  });

  it.each([[{ day: '', time: '19:00' }], [{ day: '2027-02-10', time: '' }]])(
    'leaves the deadline alone while the start %j is incomplete',
    (start) => {
      const cards: CalendarAddOnCardForm[] = [
        {
          key: 'p',
          kind: 'poll',
          poll: pollForm({ votesUntilDay: '2027-03-01', votesUntilTime: '12:00' }),
        },
      ];

      expect(toPollIssues(cards, start)).toEqual([]);
    },
  );
});

describe('toVoteSet', () => {
  it.each([
    ['single: first pick', [], 2, false, [2]],
    ['single: switch', [1], 2, false, [2]],
    ['single: tap the held one withdraws', [2], 2, false, []],
    ['multiple: add', [1], 2, true, [1, 2]],
    ['multiple: drop', [1, 2], 1, true, [2]],
    ['multiple: drop the last', [3], 3, true, []],
  ] as const)('%s', (_case, chosen, optionId, multiple, expected) => {
    expect(toVoteSet(chosen, optionId, multiple)).toEqual(expected);
  });
});

describe('toViewerChoice', () => {
  it('reads the options the viewer chose', () => {
    expect(
      toViewerChoice({ options: [option(1, 2, true), option(2, 1), option(3, 4, true)] }),
    ).toEqual([1, 3]);
  });
});

describe('toPollResults', () => {
  it.each([
    ['no votes', false, 0, [0, 0, 0], [0, 0, 0], [false, false, false]],
    ['single, balanced to 100', false, 3, [1, 1, 1], [34, 33, 33], [true, true, true]],
    ['single, clear leader', false, 4, [3, 1, 0], [75, 25, 0], [true, false, false]],
    ['single, largest remainder rises', false, 7, [2, 2, 3], [29, 28, 43], [false, false, true]],
    ['multiple, share of voters', true, 4, [4, 2, 1], [100, 50, 25], [true, false, false]],
    ['multiple, tied leaders', true, 3, [2, 2, 1], [67, 67, 33], [true, true, false]],
  ] as const)('%s', (_case, multiple, voterCount, counts, percents, leading) => {
    const results = toPollResults(
      poll({
        allowsMultipleChoices: multiple,
        voterCount,
        options: counts.map((count, index) => option(index + 1, count)),
      }),
      [2],
    );

    expect(results.map((result) => [result.percent, result.isLeading, result.isChosen])).toEqual(
      percents.map((percent, index) => [percent, leading[index], index === 1]),
    );
  });
});

describe('toPollFormLocks', () => {
  it.each([
    ['a new poll', null, 2, [[], false, false, false, true]],
    [
      'a held multiple-choice anonymous poll with votes',
      poll({
        allowsMultipleChoices: true,
        isAnonymous: true,
        voterCount: 2,
        options: [option(1, 2), option(2, 0), option(3, 1)],
      }),
      3,
      [[1, 3], true, true, true, true],
    ],
    [
      'a held multiple-choice poll where everyone holds one vote',
      poll({
        allowsMultipleChoices: true,
        voterCount: 3,
        options: [option(1, 2), option(2, 1)],
      }),
      2,
      [[1, 2], false, false, false, true],
    ],
    [
      'a held single-choice open poll with votes',
      poll({ voterCount: 1, options: [option(1, 0), option(2, 1)] }),
      20,
      [[2], false, false, true, false],
    ],
    [
      'a held multiple-choice poll without votes',
      poll({ allowsMultipleChoices: true, isAnonymous: true }),
      2,
      [[], false, false, false, true],
    ],
  ] as const)('locks %s', (_case, held, optionCount, expected) => {
    const locks = toPollFormLocks(held, {
      options: Array.from({ length: optionCount }, (_, index) => ({
        key: `o${index}`,
        optionId: null,
        label: '',
      })),
    });

    expect([
      locks.lockedOptionIds,
      locks.isChoiceModeLocked,
      locks.isAnonymityLocked,
      locks.canRemoveOptions,
      locks.canAddOptions,
    ]).toEqual(expected);
  });
});

describe('poll round trip', () => {
  it.each([[null], [toInstant('2027-02-09', '18:30')]])(
    'carries a held poll with deadline %s back out unchanged',
    (votesUntil) => {
      const held = poll({
        allowsMultipleChoices: true,
        isAnonymous: true,
        votesUntil,
        options: [option(1, 2), option(5, 0)],
      });

      expect(toPollPayload(toPollForm(held))).toEqual({
        pollId: 4,
        question: 'Bus oder Bahn?',
        allowsMultipleChoices: true,
        isAnonymous: true,
        votesUntil,
        options: [
          { optionId: 1, label: 'Antwort 1' },
          { optionId: 5, label: 'Antwort 5' },
        ],
      });
    },
  );

  it.each([
    ['unchanged keeps the held instant', '2027-02-09T17:30:45.500Z', null],
    ['moved writes the new minute', '2027-02-09T17:30:45.500Z', '20:15'],
  ])('a deadline %s', (_case, heldVotesUntil, movedTime) => {
    const form = toPollForm(poll({ votesUntil: heldVotesUntil }));
    const time = movedTime ?? form.votesUntilTime;
    const payload = toPollPayload({ ...form, votesUntilTime: time });

    expect(payload.votesUntil).toBe(
      movedTime === null ? heldVotesUntil : toInstant(form.votesUntilDay, movedTime),
    );
  });

  it('trims what was typed and sends new answers without id', () => {
    const payload = toPollPayload(
      pollForm({ question: '  Bus oder Bahn? ', options: labels(' Bus ', 'Bahn') }),
    );

    expect([payload.question, payload.options]).toEqual([
      'Bus oder Bahn?',
      [
        { optionId: null, label: 'Bus' },
        { optionId: null, label: 'Bahn' },
      ],
    ]);
  });
});

describe('withVotesUntilDay', () => {
  it.each([
    ['', '', '2027-02-09', ['2027-02-09', '19:00']],
    ['2027-02-08', '12:00', '2027-02-09', ['2027-02-09', '12:00']],
    ['2027-02-08', '12:00', null, ['', '']],
  ] as const)('from %s %s choosing %s gives %j', (day, time, chosen, expected) => {
    const changed = withVotesUntilDay(
      pollForm({ votesUntilDay: day, votesUntilTime: time }),
      chosen,
      '19:00',
    );

    expect([changed.votesUntilDay, changed.votesUntilTime]).toEqual(expected);
  });
});
