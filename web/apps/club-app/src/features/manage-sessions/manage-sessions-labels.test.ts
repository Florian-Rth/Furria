import { describe, expect, it } from 'vitest';
import {
  findSessionRecord,
  partitionSessionRecords,
  sessionMottoStateOf,
} from './manage-sessions-labels';
import type { SessionRecordSummary } from './schemas';

const record = (overrides: Partial<SessionRecordSummary>): SessionRecordSummary => ({
  sessionId: 7,
  startYear: 2025,
  number: 53,
  motto: 'Wir sind die Narren vom Rhein',
  logoSvg: null,
  ...overrides,
});

const INSIDE_THE_SESSION = new Date(2026, 0, 15);
const BETWEEN_SESSIONS = new Date(2026, 6, 1);

describe('findSessionRecord', () => {
  it.each([
    { scenario: 'no session record is targeted', sessionId: null, expected: null },
    { scenario: 'an unknown id', sessionId: 999, expected: null },
    { scenario: 'the targeted session record', sessionId: 7, expected: 7 },
  ])('finds $expected for $scenario', ({ sessionId, expected }) => {
    expect(findSessionRecord([record({ sessionId: 7 })], sessionId)?.sessionId ?? null).toBe(
      expected,
    );
  });
});

describe('sessionMottoStateOf', () => {
  it.each([
    {
      scenario: 'a written motto',
      motto: 'Helau',
      startYear: 2019,
      today: INSIDE_THE_SESSION,
      expected: 'written',
    },
    {
      scenario: 'a blank motto of a past season',
      motto: '  ',
      startYear: 2019,
      today: INSIDE_THE_SESSION,
      expected: 'unrecorded',
    },
    {
      scenario: 'no motto for the running season',
      motto: null,
      startYear: 2025,
      today: INSIDE_THE_SESSION,
      expected: 'pending',
    },
    {
      scenario: 'no motto for the coming season',
      motto: null,
      startYear: 2026,
      today: BETWEEN_SESSIONS,
      expected: 'pending',
    },
    {
      scenario: 'no motto for the season that just ended',
      motto: null,
      startYear: 2025,
      today: BETWEEN_SESSIONS,
      expected: 'unrecorded',
    },
  ])('reads $scenario as $expected', ({ motto, startYear, today, expected }) => {
    expect(sessionMottoStateOf(record({ startYear, motto }), today).kind).toBe(expected);
  });
});

describe('partitionSessionRecords', () => {
  const idsOf = (records: readonly SessionRecordSummary[]): number[] =>
    records.map((entry) => entry.sessionId);

  it('splits the running and coming seasons from the past ones', () => {
    const partition = partitionSessionRecords(
      [
        record({ sessionId: 1, startYear: 2026 }),
        record({ sessionId: 2, startYear: 2025 }),
        record({ sessionId: 3, startYear: 2024 }),
      ],
      INSIDE_THE_SESSION,
    );

    expect({
      ahead: idsOf(partition.ahead),
      past: idsOf(partition.past),
      vacantYear: partition.vacantYear,
    }).toEqual({ ahead: [1, 2], past: [3], vacantYear: null });
  });

  it.each([
    { case: 'only past records', startYears: [2024], today: INSIDE_THE_SESSION, vacantYear: 2025 },
    { case: 'only a later season', startYears: [2027], today: BETWEEN_SESSIONS, vacantYear: 2026 },
    { case: 'the season recorded', startYears: [2026], today: BETWEEN_SESSIONS, vacantYear: null },
  ])('names the unrecorded relevant season with $case', ({ startYears, today, vacantYear }) => {
    const records = startYears.map((startYear, index) =>
      record({ sessionId: index + 1, startYear }),
    );

    expect(partitionSessionRecords(records, today).vacantYear).toBe(vacantYear);
  });
});
