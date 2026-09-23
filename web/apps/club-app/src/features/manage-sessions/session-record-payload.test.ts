import { describe, expect, it } from 'vitest';
import type { SessionRecordForm, SessionRecordSummary } from './schemas';
import { toSessionRecordForm, toSessionRecordPayload } from './session-record-payload';

const form = (overrides: Partial<SessionRecordForm>): SessionRecordForm => ({
  startYear: 2026,
  number: '53',
  motto: 'Wir sind die Narren vom Rhein',
  logoSvg: '<svg viewBox="0 0 2 1"></svg>',
  ...overrides,
});

const record = (overrides: Partial<SessionRecordSummary>): SessionRecordSummary => ({
  sessionId: 7,
  startYear: 2026,
  number: 53,
  motto: 'Wir sind die Narren vom Rhein',
  logoSvg: '<svg viewBox="0 0 2 1"></svg>',
  ...overrides,
});

describe('toSessionRecordPayload', () => {
  it('sends nothing while the season is unpicked', () => {
    expect(toSessionRecordPayload(form({ startYear: null }))).toBeNull();
  });

  it('sends the Sessionsnummer as a number', () => {
    expect(toSessionRecordPayload(form({ number: '53' }))?.number).toBe(53);
  });

  it.each([
    ['', null],
    ['   ', null],
    ['53', 53],
  ])('turns the typed Sessionsnummer %j into %j', (typed, expected) => {
    expect(toSessionRecordPayload(form({ number: typed }))?.number).toBe(expected);
  });

  it.each(['', '   '])('reports a blank Motto %j as unknown', (typed) => {
    expect(toSessionRecordPayload(form({ motto: typed }))?.motto).toBeNull();
  });

  it('trims the Motto the club typed', () => {
    expect(toSessionRecordPayload(form({ motto: '  Vom Festzelt ins All  ' }))?.motto).toBe(
      'Vom Festzelt ins All',
    );
  });

  it.each([null, '', '  \n '])('reports a blank Logo %j as unknown', (typed) => {
    expect(toSessionRecordPayload(form({ logoSvg: typed }))?.logoSvg).toBeNull();
  });

  it('keeps a future season', () => {
    expect(toSessionRecordPayload(form({ startYear: 2031 }))?.startYear).toBe(2031);
  });
});

describe('toSessionRecordForm', () => {
  it.each([
    { case: 'without a year', draftYear: null },
    { case: 'on the year it was asked for', draftYear: 2026 },
  ])('opens empty without a record, $case', ({ draftYear }) => {
    expect(toSessionRecordForm(null, draftYear)).toEqual({
      startYear: draftYear,
      number: '',
      motto: '',
      logoSvg: null,
    });
  });

  it('reads an unknown Sessionsnummer and Motto as empty fields', () => {
    expect(toSessionRecordForm(record({ number: null, motto: null }), 2030)).toEqual({
      startYear: 2026,
      number: '',
      motto: '',
      logoSvg: '<svg viewBox="0 0 2 1"></svg>',
    });
  });

  it('carries the recorded Sessionsnummer into the field', () => {
    expect(toSessionRecordForm(record({ number: 7 }), null).number).toBe('7');
  });
});
