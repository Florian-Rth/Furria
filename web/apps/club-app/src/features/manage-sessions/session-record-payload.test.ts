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

  it('sends the session number as a number', () => {
    expect(toSessionRecordPayload(form({ number: '53' }))?.number).toBe(53);
  });

  it.each([
    ['', null],
    ['   ', null],
    ['53', 53],
  ])('turns the typed session number %j into %j', (typed, expected) => {
    expect(toSessionRecordPayload(form({ number: typed }))?.number).toBe(expected);
  });

  it.each(['', '   '])('reports a blank motto %j as unknown', (typed) => {
    expect(toSessionRecordPayload(form({ motto: typed }))?.motto).toBeNull();
  });

  it('trims the motto the club typed', () => {
    expect(toSessionRecordPayload(form({ motto: '  Vom Festzelt ins All  ' }))?.motto).toBe(
      'Vom Festzelt ins All',
    );
  });

  it.each([null, '', '  \n '])('reports a blank session logo %j as unknown', (typed) => {
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

  it('reads an unknown session number and motto as empty fields', () => {
    expect(toSessionRecordForm(record({ number: null, motto: null }), 2030)).toEqual({
      startYear: 2026,
      number: '',
      motto: '',
      logoSvg: '<svg viewBox="0 0 2 1"></svg>',
    });
  });

  it('carries the recorded session number into the field', () => {
    expect(toSessionRecordForm(record({ number: 7 }), null).number).toBe('7');
  });
});
