import { describe, expect, it } from 'vitest';
import {
  findSessionRecord,
  isRelevantSession,
  partitionSessionRecords,
  toSessionRecordId,
  toSessionRowChip,
  toSessionRowLabel,
  toSessionRowMotto,
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

describe('toSessionRecordId', () => {
  it.each([
    { case: 'a positive id', raw: '3', expected: 3 },
    { case: 'a long id', raw: '1204', expected: 1204 },
    { case: 'zero', raw: '0', expected: null },
    { case: 'a negative id', raw: '-3', expected: null },
    { case: 'a word', raw: 'session', expected: null },
    { case: 'a decimal', raw: '3.5', expected: null },
    { case: 'nothing', raw: '', expected: null },
  ])('reads $case', ({ raw, expected }) => {
    expect(toSessionRecordId(raw)).toBe(expected);
  });
});

describe('findSessionRecord', () => {
  it('finds nothing when no Sessionseintrag is targeted', () => {
    expect(findSessionRecord([record({})], null)).toBeNull();
  });

  it('finds nothing for an unknown id', () => {
    expect(findSessionRecord([record({ sessionId: 7 })], 999)).toBeNull();
  });

  it('finds the targeted Sessionseintrag', () => {
    expect(findSessionRecord([record({ sessionId: 7 })], 7)?.sessionId).toBe(7);
  });
});

describe('toSessionRowLabel', () => {
  it('names the season, the Sessionsnummer and the Motto', () => {
    expect(toSessionRowLabel(record({}))).toBe(
      '2025/26 · 53. Session · „Wir sind die Narren vom Rhein“',
    );
  });

  it('leaves out the Sessionsnummer the club never wrote down', () => {
    expect(toSessionRowLabel(record({ number: null }))).toBe(
      '2025/26 · „Wir sind die Narren vom Rhein“',
    );
  });

  it('leaves out the Motto the club never wrote down', () => {
    expect(toSessionRowLabel(record({ motto: null }))).toBe('2025/26 · 53. Session');
  });

  it('names a season known by its year alone', () => {
    expect(toSessionRowLabel(record({ number: null, motto: null }))).toBe('2025/26');
  });

  it.each(['', '   '])('treats the blank Motto %j as never written down', (motto) => {
    expect(toSessionRowLabel(record({ number: null, motto }))).toBe('2025/26');
  });
});

describe('toSessionRowMotto', () => {
  it('speaks a written Motto in quotes', () => {
    expect(toSessionRowMotto(record({}), INSIDE_THE_SESSION)).toEqual({
      line: '„Wir sind die Narren vom Rhein“',
      missing: false,
    });
  });

  it.each([
    { case: 'a past season', startYear: 2019, today: INSIDE_THE_SESSION, pending: false },
    { case: 'the running season', startYear: 2025, today: INSIDE_THE_SESSION, pending: true },
    { case: 'the coming season', startYear: 2026, today: BETWEEN_SESSIONS, pending: true },
    {
      case: 'the season that just ended',
      startYear: 2025,
      today: BETWEEN_SESSIONS,
      pending: false,
    },
  ])('tells a missing Motto of $case apart', ({ startYear, today, pending }) => {
    const pendingLine = toSessionRowMotto(record({ startYear: 2030, motto: null }), today).line;
    const motto = toSessionRowMotto(record({ startYear, motto: '  ' }), today);

    expect(motto.missing).toBe(true);
    expect(motto.line === pendingLine).toBe(pending);
  });
});

describe('isRelevantSession', () => {
  it('marks the season the day falls into', () => {
    expect(isRelevantSession(record({ startYear: 2025 }), INSIDE_THE_SESSION)).toBe(true);
  });

  it('leaves the season before it unmarked', () => {
    expect(isRelevantSession(record({ startYear: 2024 }), INSIDE_THE_SESSION)).toBe(false);
  });

  it('marks the coming season between two of them', () => {
    expect(isRelevantSession(record({ startYear: 2026 }), BETWEEN_SESSIONS)).toBe(true);
  });

  it('leaves the season that just ended unmarked', () => {
    expect(isRelevantSession(record({ startYear: 2025 }), BETWEEN_SESSIONS)).toBe(false);
  });
});

describe('toSessionRowChip', () => {
  it('chips only the season the day falls into', () => {
    expect(toSessionRowChip(record({ startYear: 2025 }), INSIDE_THE_SESSION)).not.toBeNull();
  });

  it('leaves every other season without a chip', () => {
    expect(toSessionRowChip(record({ startYear: 2019 }), INSIDE_THE_SESSION)).toBeNull();
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

    expect(idsOf(partition.ahead)).toEqual([1, 2]);
    expect(idsOf(partition.past)).toEqual([3]);
    expect(partition.vacantYear).toBeNull();
  });

  it.each([
    { case: 'no records at all', startYears: [], today: INSIDE_THE_SESSION, vacantYear: 2025 },
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
