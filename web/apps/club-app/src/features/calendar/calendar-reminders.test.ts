import { describe, expect, it } from 'vitest';
import type { CalendarReminderSource, ReminderAvailability } from './calendar-reminders';
import { toReminderAvailability } from './calendar-reminders';

const NOW_MS = Date.parse('2027-01-15T12:00:00Z');
const MARA = { personId: 3, firstName: 'Mara', lastName: 'Offen' };

describe('toReminderAvailability', () => {
  it.each<{ source: CalendarReminderSource; expected: ReminderAvailability }>([
    {
      source: {
        target: { host: { kind: 'calendarEntry', calendarEntryId: 1 }, kind: 'poll', addOnId: 2 },
        reminder: { lastRemindedAt: null, remindableFrom: null, reachableCount: 1 },
        notAnswered: [MARA],
        isClosed: true,
      },
      expected: 'hidden',
    },
    {
      source: {
        target: { host: { kind: 'calendarEntry', calendarEntryId: 1 }, kind: 'poll', addOnId: 2 },
        reminder: { lastRemindedAt: null, remindableFrom: null, reachableCount: 0 },
        notAnswered: [MARA],
        isClosed: false,
      },
      expected: 'unreachable',
    },
    {
      source: {
        target: {
          host: { kind: 'calendarEntry', calendarEntryId: 1 },
          kind: 'attendance',
          addOnId: null,
        },
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
        target: {
          host: { kind: 'calendarEntry', calendarEntryId: 1 },
          kind: 'attendance',
          addOnId: null,
        },
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
