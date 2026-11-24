import { describe, expect, it } from 'vitest';
import { toDayTime, toInstant } from '@/lib/day';
import type { CalendarDeadlineIssueCode } from './calendar-deadlines';
import { toDeadlineInstant, toDeadlineIssue } from './calendar-deadlines';

const START = { day: '2027-02-10', time: '19:00' };
const HELD = '2027-02-09T17:30:45.500Z';

describe('toDeadlineIssue', () => {
  it.each<
    [string, string, string, { day: string; time: string }, CalendarDeadlineIssueCode | null]
  >([
    ['a day without time', '2027-02-09', '', START, 'deadlineTimeMissing'],
    ['a deadline after the start', '2027-02-10', '19:01', START, 'deadlineAfterStart'],
    ['a start without day', '2027-03-01', '12:00', { day: '', time: '19:00' }, null],
  ])('finds for %s', (_case, day, time, start, expected) => {
    expect(toDeadlineIssue({ day, time }, start)).toBe(expected);
  });
});

describe('toDeadlineInstant', () => {
  it.each<[string, { day: string; time: string; held: string | null }, string | null]>([
    ['an untouched held deadline', { ...toDayTime(HELD), held: HELD }, HELD],
  ])('writes for %s', (_case, deadline, expected) => {
    expect(toDeadlineInstant(deadline)).toBe(expected);
  });

  it.each<[string, string | null]>([['a moved held deadline', HELD]])(
    'writes the chosen minute for %s',
    (_case, held) => {
      expect(toDeadlineInstant({ day: '2027-02-09', time: '20:15', held })).toBe(
        toInstant('2027-02-09', '20:15'),
      );
    },
  );
});
