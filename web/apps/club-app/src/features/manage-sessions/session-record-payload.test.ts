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

  it.each([
    ['   ', null],
    ['53', 53],
  ])('turns the typed session number %j into %j', (typed, expected) => {
    expect(toSessionRecordPayload(form({ number: typed }))?.number).toBe(expected);
  });

  it.each(['   '])('reports a blank motto %j as unknown', (typed) => {
    expect(toSessionRecordPayload(form({ motto: typed }))?.motto).toBeNull();
  });

  it('trims the motto the club typed', () => {
    expect(toSessionRecordPayload(form({ motto: '  Vom Festzelt ins All  ' }))?.motto).toBe(
      'Vom Festzelt ins All',
    );
  });

  it.each([null, '  \n '])('reports a blank session logo %j as unknown', (typed) => {
    expect(toSessionRecordPayload(form({ logoSvg: typed }))?.logoSvg).toBeNull();
  });
});

describe('toSessionRecordForm', () => {
  it('opens empty without a record, on the year it was asked for', () => {
    expect(toSessionRecordForm(null, 2026)).toEqual({
      startYear: 2026,
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
