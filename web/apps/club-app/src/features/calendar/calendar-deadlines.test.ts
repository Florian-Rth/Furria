import { describe, expect, it } from 'vitest';
import { toDayTime, toInstant } from '@/lib/day';
import type { CalendarDeadlineIssueCode } from './calendar-deadlines';
import {
  toDeadlineDayChange,
  toDeadlineFields,
  toDeadlineInstant,
  toDeadlineIssue,
  toDeadlineIssueCodes,
  toDeadlinePaths,
} from './calendar-deadlines';
import type { CalendarAddOnCardForm } from './schemas';

const START = { day: '2027-02-10', time: '19:00' };
const HELD = '2027-02-09T17:30:45.500Z';

describe('toDeadlineIssue', () => {
  it.each<
    [string, string, string, { day: string; time: string }, CalendarDeadlineIssueCode | null]
  >([
    ['no deadline', '', '', START, null],
    ['a day without time', '2027-02-09', '', START, 'deadlineTimeMissing'],
    ['a deadline before the start', '2027-02-09', '12:00', START, null],
    ['a deadline right at the start', '2027-02-10', '19:00', START, null],
    ['a deadline after the start', '2027-02-10', '19:01', START, 'deadlineAfterStart'],
    ['a start without day', '2027-03-01', '12:00', { day: '', time: '19:00' }, null],
    ['a start without time', '2027-03-01', '12:00', { day: '2027-02-10', time: '' }, null],
  ])('finds for %s', (_case, day, time, start, expected) => {
    expect(toDeadlineIssue({ day, time }, start)).toBe(expected);
  });
});

describe('toDeadlineIssueCodes', () => {
  it.each<[string, string, string, CalendarDeadlineIssueCode[]]>([
    ['a fine deadline', '2027-02-09', '12:00', []],
    ['a deadline after the start', '2027-02-11', '12:00', ['deadlineAfterStart']],
  ])('lists for %s', (_case, day, time, expected) => {
    expect(toDeadlineIssueCodes({ day, time }, START)).toEqual(expected);
  });
});

describe('toDeadlineInstant', () => {
  it.each<[string, { day: string; time: string; held: string | null }, string | null]>([
    ['no deadline', { day: '', time: '', held: HELD }, null],
    ['an untouched held deadline', { ...toDayTime(HELD), held: HELD }, HELD],
  ])('writes for %s', (_case, deadline, expected) => {
    expect(toDeadlineInstant(deadline)).toBe(expected);
  });

  it.each<[string, string | null]>([
    ['a moved held deadline', HELD],
    ['a new deadline', null],
  ])('writes the chosen minute for %s', (_case, held) => {
    expect(toDeadlineInstant({ day: '2027-02-09', time: '20:15', held })).toBe(
      toInstant('2027-02-09', '20:15'),
    );
  });
});

describe('toDeadlineFields', () => {
  it('reads no deadline as empty fields', () => {
    expect(toDeadlineFields(null)).toEqual({ day: '', time: '', held: null });
  });

  it('keeps the held instant beside its day and time', () => {
    expect(toDeadlineFields(toInstant('2027-02-09', '18:30'))).toEqual({
      day: '2027-02-09',
      time: '18:30',
      held: toInstant('2027-02-09', '18:30'),
    });
  });
});

describe('toDeadlineDayChange', () => {
  it.each<[string, string | null, { day: string; time: string }]>([
    ['', '2027-02-09', { day: '2027-02-09', time: '19:00' }],
    ['12:00', '2027-02-09', { day: '2027-02-09', time: '12:00' }],
    ['12:00', null, { day: '', time: '' }],
    ['12:00', '', { day: '', time: '' }],
  ])('from time %j choosing %j gives %j', (time, day, expected) => {
    expect(toDeadlineDayChange({ time }, day, '19:00')).toEqual(expected);
  });
});

describe('toDeadlinePaths', () => {
  it('rechecks only the polls and lists that carry a deadline', () => {
    const cards: CalendarAddOnCardForm[] = [
      { key: 'attendance', kind: 'attendance' },
      {
        key: 'p1',
        kind: 'poll',
        poll: {
          pollId: null,
          question: '',
          allowsMultipleChoices: false,
          isAnonymous: false,
          votesUntilDay: '2027-02-09',
          votesUntilTime: '12:00',
          heldVotesUntil: null,
          options: [],
        },
      },
      {
        key: 'l1',
        kind: 'signUpList',
        signUpList: {
          signUpListId: null,
          title: '',
          hint: '',
          signUpUntilDay: '',
          signUpUntilTime: '',
          heldSignUpUntil: null,
        },
      },
      {
        key: 'l2',
        kind: 'signUpList',
        signUpList: {
          signUpListId: null,
          title: '',
          hint: '',
          signUpUntilDay: '2027-02-09',
          signUpUntilTime: '12:00',
          heldSignUpUntil: null,
        },
      },
    ];

    expect(toDeadlinePaths(cards)).toEqual([
      'addOns.1.poll.votesUntilTime',
      'addOns.3.signUpList.signUpUntilTime',
    ]);
  });
});
