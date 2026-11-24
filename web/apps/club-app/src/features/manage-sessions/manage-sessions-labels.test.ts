import { describe, expect, it } from 'vitest';
import { partitionSessionRecords, sessionMottoStateOf } from './manage-sessions-labels';
import type { SessionRecordSummary } from './schemas';

const record = (overrides: Partial<SessionRecordSummary>): SessionRecordSummary => ({
  sessionId: 7,
  startYear: 2025,
  number: 53,
  motto: 'Wir sind die Narren vom Rhein',
  logo: null,
  ...overrides,
});

const INSIDE_THE_SESSION = new Date(2026, 0, 15);
const BETWEEN_SESSIONS = new Date(2026, 6, 1);

describe('sessionMottoStateOf', () => {
  it.each([
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
  it.each([
    { case: 'only past records', startYears: [2024], today: INSIDE_THE_SESSION, vacantYear: 2025 },
    { case: 'only a later season', startYears: [2027], today: BETWEEN_SESSIONS, vacantYear: 2026 },
  ])('names the unrecorded relevant season with $case', ({ startYears, today, vacantYear }) => {
    const records = startYears.map((startYear, index) =>
      record({ sessionId: index + 1, startYear }),
    );

    expect(partitionSessionRecords(records, today).vacantYear).toBe(vacantYear);
  });
});
