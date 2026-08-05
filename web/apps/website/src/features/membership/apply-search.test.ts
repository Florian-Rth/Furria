import { describe, expect, it } from 'vitest';
import { ApplySearchSchema, parseGroupInterestsParam } from './apply-search';

describe('ApplySearchSchema', () => {
  it('takes the Gruppen the Matcher handed over', () => {
    expect(ApplySearchSchema.parse({ groups: 'tanzgarde,organisation' })).toEqual({
      groups: 'tanzgarde,organisation',
    });
  });

  it('accepts a visit without any search param', () => {
    expect(ApplySearchSchema.parse({})).toEqual({ groups: undefined });
  });

  it('swallows a param of the wrong shape instead of failing the route', () => {
    expect(ApplySearchSchema.parse({ groups: ['tanzgarde', 'organisation'] })).toEqual({
      groups: undefined,
    });
    expect(ApplySearchSchema.parse({ groups: 42 })).toEqual({ groups: undefined });
    expect(ApplySearchSchema.parse({ groups: null })).toEqual({ groups: undefined });
  });

  it('ignores search params that are none of its business', () => {
    expect(ApplySearchSchema.parse({ photo: 3 })).toEqual({ groups: undefined });
  });
});

describe('parseGroupInterestsParam', () => {
  it('reads the comma-separated ids the Matcher wrote', () => {
    expect(parseGroupInterestsParam('tanzgarde,organisation')).toEqual([
      'tanzgarde',
      'organisation',
    ]);
  });

  it('reads a single id', () => {
    expect(parseGroupInterestsParam('kindergarde')).toEqual(['kindergarde']);
  });

  it('prefills nothing when nobody handed anything over', () => {
    expect(parseGroupInterestsParam(undefined)).toEqual([]);
  });

  it('prefills nothing for an empty or comma-only param', () => {
    expect(parseGroupInterestsParam('')).toEqual([]);
    expect(parseGroupInterestsParam(',,,')).toEqual([]);
  });

  it('trims the ids and drops the gaps between stray commas', () => {
    expect(parseGroupInterestsParam(' tanzgarde , , organisation ')).toEqual([
      'tanzgarde',
      'organisation',
    ]);
  });

  it('keeps a repeated id only once', () => {
    expect(parseGroupInterestsParam('tanzgarde,tanzgarde')).toEqual(['tanzgarde']);
  });

  it('keeps the order the Matcher ranked them in', () => {
    expect(parseGroupInterestsParam('organisation,tanzgarde')).toEqual([
      'organisation',
      'tanzgarde',
    ]);
  });
});
