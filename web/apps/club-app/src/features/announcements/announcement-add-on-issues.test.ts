import { describe, expect, it } from 'vitest';
import {
  toAnnouncementAddOnIssues,
  toAnnouncementDeadlineStart,
} from './announcement-add-on-issues';
import type { AnnouncementAddOnCardForm } from './schemas';

const attendance = (day: string, time: string): AnnouncementAddOnCardForm => ({
  key: 'attendance',
  kind: 'attendance',
  attendance: { answersUntilDay: day, answersUntilTime: time, heldAnswersUntil: null },
});

const signUpList = (day: string, time: string): AnnouncementAddOnCardForm => ({
  key: 'list',
  kind: 'signUpList',
  signUpList: {
    signUpListId: null,
    title: 'Wer backt?',
    hint: '',
    signUpUntilDay: day,
    signUpUntilTime: time,
    heldSignUpUntil: null,
  },
});

describe('toAnnouncementDeadlineStart', () => {
  it.each([
    [null, { day: '', time: '' }],
    ['2026-11-30', { day: '2026-12-01', time: '00:00' }],
  ] as const)('closes an Aushang valid until %s at %o', (validUntil, expected) => {
    expect(toAnnouncementDeadlineStart(validUntil)).toEqual(expected);
  });
});

describe('toAnnouncementAddOnIssues', () => {
  it.each([
    ['a deadline on the last day', [attendance('2026-11-30', '23:30')], '2026-11-30', []],
    ['any deadline on an open-ended Aushang', [attendance('2027-05-01', '10:00')], null, []],
    ['no deadline', [attendance('', '')], '2026-11-30', []],
    [
      'an answer deadline after the last day',
      [attendance('2026-12-01', '10:00')],
      '2026-11-30',
      [
        {
          addOn: 'attendance',
          code: 'deadlineAfterStart',
          path: ['addOns', 0, 'attendance', 'answersUntilTime'],
        },
      ],
    ],
    [
      'an answer deadline without a time',
      [attendance('2026-11-20', '')],
      null,
      [
        {
          addOn: 'attendance',
          code: 'deadlineTimeMissing',
          path: ['addOns', 0, 'attendance', 'answersUntilTime'],
        },
      ],
    ],
    [
      'a list deadline after the last day',
      [attendance('', ''), signUpList('2026-12-02', '08:00')],
      '2026-11-30',
      [
        {
          addOn: 'signUpList',
          code: 'deadlineAfterStart',
          path: ['addOns', 1, 'signUpList', 'signUpUntilTime'],
        },
      ],
    ],
    [
      'a closed list keeping its deadline after the last day',
      [
        {
          key: 'list',
          kind: 'signUpList',
          signUpList: {
            signUpListId: 5,
            title: 'Wer backt?',
            hint: '',
            signUpUntilDay: '2026-12-05',
            signUpUntilTime: '10:00',
            heldSignUpUntil: new Date(2026, 11, 5, 10).toISOString(),
          },
        },
      ],
      '2026-11-30',
      [],
    ],
  ] as const)('flags %s', (_case, cards, validUntil, expected) => {
    expect(toAnnouncementAddOnIssues(cards, validUntil)).toEqual(expected);
  });
});
