import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import type {
  CalendarReminderSource,
  RemindedAt,
  ReminderAvailability,
  ReminderFailure,
  ReminderMeta,
} from './calendar-reminders';
import {
  toAttendanceReminderSource,
  toPollReminderSource,
  toRemindedAt,
  toReminderAvailability,
  toReminderFailure,
  toReminderMeta,
  toSignUpListReminderSource,
} from './calendar-reminders';

const NOW_MS = Date.parse('2027-01-15T12:00:00Z');
const MARA = { personId: 3, firstName: 'Mara', lastName: 'Offen' };

describe('toReminderAvailability', () => {
  it.each<{ source: CalendarReminderSource; expected: ReminderAvailability }>([
    {
      source: {
        target: { calendarEntryId: 1, kind: 'attendance', addOnId: null },
        reminder: null,
        notAnswered: null,
        isClosed: false,
      },
      expected: 'hidden',
    },
    {
      source: {
        target: { calendarEntryId: 1, kind: 'poll', addOnId: 2 },
        reminder: { lastRemindedAt: null, remindableFrom: null, reachableCount: 1 },
        notAnswered: [],
        isClosed: false,
      },
      expected: 'hidden',
    },
    {
      source: {
        target: { calendarEntryId: 1, kind: 'poll', addOnId: 2 },
        reminder: { lastRemindedAt: null, remindableFrom: null, reachableCount: 1 },
        notAnswered: [MARA],
        isClosed: true,
      },
      expected: 'hidden',
    },
    {
      source: {
        target: { calendarEntryId: 1, kind: 'poll', addOnId: 2 },
        reminder: { lastRemindedAt: null, remindableFrom: null, reachableCount: 0 },
        notAnswered: [MARA],
        isClosed: false,
      },
      expected: 'unreachable',
    },
    {
      source: {
        target: { calendarEntryId: 1, kind: 'signUpList', addOnId: 4 },
        reminder: { lastRemindedAt: null, remindableFrom: null, reachableCount: 1 },
        notAnswered: [MARA],
        isClosed: false,
      },
      expected: 'ready',
    },
    {
      source: {
        target: { calendarEntryId: 1, kind: 'attendance', addOnId: null },
        reminder: {
          lastRemindedAt: '2027-01-15T08:00:00Z',
          remindableFrom: '2027-01-15T14:00:00Z',
          reachableCount: 1,
        },
        notAnswered: [MARA],
        isClosed: false,
      },
      expected: 'waiting',
    },
    {
      source: {
        target: { calendarEntryId: 1, kind: 'attendance', addOnId: null },
        reminder: {
          lastRemindedAt: '2027-01-15T06:00:00Z',
          remindableFrom: '2027-01-15T12:00:00Z',
          reachableCount: 1,
        },
        notAnswered: [MARA],
        isClosed: false,
      },
      expected: 'ready',
    },
  ])('decides $expected', ({ source, expected }) => {
    expect(toReminderAvailability(source, NOW_MS)).toBe(expected);
  });
});

describe('toRemindedAt', () => {
  const now = new Date(2027, 0, 15, 18, 0);

  it.each<{ lastRemindedAt: string | null; expected: RemindedAt | null }>([
    { lastRemindedAt: null, expected: null },
    {
      lastRemindedAt: new Date(2027, 0, 15, 14, 30).toISOString(),
      expected: { kind: 'today', time: '14:30' },
    },
    {
      lastRemindedAt: new Date(2027, 0, 14, 21, 5).toISOString(),
      expected: { kind: 'earlier', day: '14.01.' },
    },
  ])('reads $lastRemindedAt', ({ lastRemindedAt, expected }) => {
    expect(toRemindedAt(lastRemindedAt, now)).toEqual(expected);
  });
});

describe('toReminderMeta', () => {
  const now = new Date(2027, 0, 15, 18, 0);
  const remindedAt = new Date(2027, 0, 15, 14, 30).toISOString();
  const remindableFrom = new Date(2027, 0, 15, 20, 30).toISOString();

  it.each<{
    availability: ReminderAvailability;
    lastRemindedAt: string | null;
    expected: ReminderMeta | null;
  }>([
    { availability: 'unreachable', lastRemindedAt: null, expected: { kind: 'unreachable' } },
    {
      availability: 'waiting',
      lastRemindedAt: remindedAt,
      expected: { kind: 'again', time: '20:30' },
    },
    {
      availability: 'ready',
      lastRemindedAt: remindedAt,
      expected: { kind: 'reminded', reminded: { kind: 'today', time: '14:30' } },
    },
    { availability: 'ready', lastRemindedAt: null, expected: null },
  ])('says $expected when $availability', ({ availability, lastRemindedAt, expected }) => {
    const reminder = {
      lastRemindedAt,
      remindableFrom: lastRemindedAt === null ? null : remindableFrom,
      reachableCount: 1,
    };

    expect(toReminderMeta(availability, reminder, now)).toEqual(expected);
  });
});

describe('toReminderFailure', () => {
  it.each<{ error: Error; expected: ReminderFailure }>([
    {
      error: new ApiError({ kind: 'refused', status: 409, fields: [] }),
      expected: 'recentlyReminded',
    },
    { error: new ApiError({ kind: 'refused', status: 422, fields: [] }), expected: 'failed' },
    { error: new ApiError({ kind: 'unreachable' }), expected: 'failed' },
  ])('reads $expected', ({ error, expected }) => {
    expect(toReminderFailure(error)).toBe(expected);
  });
});

describe('reminder sources', () => {
  const reminder = { lastRemindedAt: null, remindableFrom: null, reachableCount: 2 };

  it('targets the Zu-/Absage of the entry, or nothing without one', () => {
    expect([
      toAttendanceReminderSource({ calendarEntryId: 7, attendance: null }),
      toAttendanceReminderSource({
        calendarEntryId: 7,
        attendance: {
          isClosed: false,
          yes: 0,
          maybe: 0,
          no: 0,
          answers: null,
          notAnswered: null,
          reminder,
        },
      }),
    ]).toEqual([
      null,
      {
        target: { calendarEntryId: 7, kind: 'attendance', addOnId: null },
        reminder,
        notAnswered: null,
        isClosed: false,
      },
    ]);
  });

  it('targets a poll and a list by their ids', () => {
    const poll = toPollReminderSource(7, {
      pollId: 3,
      question: 'Was bringst du mit?',
      allowsMultipleChoices: false,
      isAnonymous: false,
      votesUntil: null,
      closedAt: null,
      closedByFirstName: null,
      closedByLastName: null,
      isClosed: true,
      voterCount: 0,
      concernedCount: null,
      notAnswered: null,
      reminder: null,
      options: [],
    });
    const list = toSignUpListReminderSource(7, {
      signUpListId: 5,
      title: 'Wer hilft?',
      hint: null,
      signUpUntil: null,
      closedAt: null,
      closedByFirstName: null,
      closedByLastName: null,
      isClosed: false,
      lines: [],
      concernedCount: null,
      notAnswered: [MARA],
      reminder,
    });

    expect([poll, list]).toEqual([
      {
        target: { calendarEntryId: 7, kind: 'poll', addOnId: 3 },
        reminder: null,
        notAnswered: null,
        isClosed: true,
      },
      {
        target: { calendarEntryId: 7, kind: 'signUpList', addOnId: 5 },
        reminder,
        notAnswered: [MARA],
        isClosed: false,
      },
    ]);
  });
});
