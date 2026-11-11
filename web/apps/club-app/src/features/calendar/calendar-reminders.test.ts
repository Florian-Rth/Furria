import { describe, expect, it } from 'vitest';
import type { CalendarReminderSource } from './calendar-reminders';
import { toReminderAvailability } from './calendar-reminders';

const NOW_MS = Date.parse('2027-01-15T12:00:00Z');
const MARA = { personId: 3, firstName: 'Mara', lastName: 'Offen' };

describe('toReminderAvailability', () => {
  it.each<{ source: CalendarReminderSource; expected: string }>([
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
        reminder: { lastRemindedAt: null, remindableFrom: null },
        notAnswered: [],
        isClosed: false,
      },
      expected: 'hidden',
    },
    {
      source: {
        target: { calendarEntryId: 1, kind: 'poll', addOnId: 2 },
        reminder: { lastRemindedAt: null, remindableFrom: null },
        notAnswered: [MARA],
        isClosed: true,
      },
      expected: 'hidden',
    },
    {
      source: {
        target: { calendarEntryId: 1, kind: 'signUpList', addOnId: 4 },
        reminder: { lastRemindedAt: null, remindableFrom: null },
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
