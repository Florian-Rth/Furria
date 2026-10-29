import { describe, expect, it } from 'vitest';
import { actsSessionOfEvening } from './planner-session';

const IN_THE_RUNNING_SESSION = new Date(2026, 11, 1, 12);
const BETWEEN_SESSIONS = new Date(2027, 6, 1, 12);
const eveningOn = (year: number, month: number, day: number): string =>
  new Date(year, month - 1, day, 19, 11).toISOString();

describe('actsSessionOfEvening', () => {
  it.each<[string, string | null, Date, number | null]>([
    ['an evening still loading', null, IN_THE_RUNNING_SESSION, null],
    ['an evening of the relevant session', eveningOn(2027, 1, 16), IN_THE_RUNNING_SESSION, null],
    ['an evening of the next session', eveningOn(2027, 11, 20), IN_THE_RUNNING_SESSION, 2027],
    ['an evening of an ended session', eveningOn(2026, 1, 17), IN_THE_RUNNING_SESSION, 2025],
    ['the coming opening between sessions', eveningOn(2027, 11, 20), BETWEEN_SESSIONS, null],
    [
      'an evening of the ended session between sessions',
      eveningOn(2027, 1, 16),
      BETWEEN_SESSIONS,
      2026,
    ],
  ])('%s', (_label, startsAt, now, expected) => {
    expect(actsSessionOfEvening(startsAt, now)).toBe(expected);
  });
});
