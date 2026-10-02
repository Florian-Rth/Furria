import { describe, expect, it } from 'vitest';
import { ApplySearchSchema, parseGroupInterestsParam } from './apply-search';

describe('ApplySearchSchema', () => {
  it('takes the groups the Matcher handed over', () => {
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
  it.each([
    ['comma-separated ids', '4,9', [4, 9]],
    ['a single id', '4', [4]],
    ['nothing handed over', undefined, []],
    ['an empty param', '', []],
    ['a comma-only param', ',,,', []],
    ['stray spaces and commas', ' 4 , , 9 ', [4, 9]],
    ['a repeated id', '4,4', [4]],
    ['the ranked order', '9,4', [9, 4]],
    ['ids that are no group ids', 'tanzgarde,0,-3,1.5,07', []],
  ])('reads %s', (_, raw, expected) => {
    expect(parseGroupInterestsParam(raw)).toEqual(expected);
  });
});
