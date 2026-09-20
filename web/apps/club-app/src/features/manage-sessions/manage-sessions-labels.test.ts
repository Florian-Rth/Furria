import { describe, expect, it } from 'vitest';
import {
  isRelevantSession,
  MISSING_MOTTO_LINE,
  toSessionRowChip,
  toSessionRowLabel,
  toSessionRowTitle,
  toSessionsIntro,
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

describe('toSessionRowLabel', () => {
  it('names the season, the Nº and the Motto', () => {
    expect(toSessionRowLabel(record({}))).toBe('2025/26 · Nº 53 · „Wir sind die Narren vom Rhein“');
  });

  it('leaves out the Nº the club never wrote down', () => {
    expect(toSessionRowLabel(record({ number: null }))).toBe(
      '2025/26 · „Wir sind die Narren vom Rhein“',
    );
  });

  it('leaves out the Motto the club never wrote down', () => {
    expect(toSessionRowLabel(record({ motto: null }))).toBe('2025/26 · Nº 53');
  });

  it('names a season known by its year alone', () => {
    expect(toSessionRowLabel(record({ number: null, motto: null }))).toBe('2025/26');
  });

  it.each(['', '   '])('treats the blank Motto %j as never written down', (motto) => {
    expect(toSessionRowLabel(record({ number: null, motto }))).toBe('2025/26');
  });
});

describe('toSessionRowTitle', () => {
  it('speaks the Motto in quotes', () => {
    expect(toSessionRowTitle(record({}))).toBe('„Wir sind die Narren vom Rhein“');
  });

  it('says the Motto is missing rather than inventing one', () => {
    expect(toSessionRowTitle(record({ motto: null }))).toBe(MISSING_MOTTO_LINE);
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

describe('toSessionsIntro', () => {
  it('names the season nobody has written down yet', () => {
    expect(toSessionsIntro([], INSIDE_THE_SESSION)).toContain('2025/26');
  });

  it('counts a single entry in the singular', () => {
    expect(toSessionsIntro([record({ startYear: 1974 })], INSIDE_THE_SESSION)).toContain(
      'Ein Sessionseintrag',
    );
  });

  it('counts several entries', () => {
    const records = [record({ startYear: 1974 }), record({ startYear: 1975 })];

    expect(toSessionsIntro(records, INSIDE_THE_SESSION)).toContain('2 Sessionseinträge');
  });

  it('reports the current season as missing while it is', () => {
    expect(toSessionsIntro([record({ startYear: 1974 })], INSIDE_THE_SESSION)).toContain(
      'Für 2025/26 fehlt der Eintrag noch.',
    );
  });

  it('reports the current season as present once it is', () => {
    const records = [record({ startYear: 1974 }), record({ startYear: 2025 })];

    expect(toSessionsIntro(records, INSIDE_THE_SESSION)).toContain('2025/26 ist dabei.');
  });
});
