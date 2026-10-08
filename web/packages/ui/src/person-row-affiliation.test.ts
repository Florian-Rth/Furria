import { describe, expect, it } from 'vitest';
import { resolvePersonRowAffiliation } from './person-row-affiliation';

describe('resolvePersonRowAffiliation', () => {
  it.each([
    {
      input: { accent: 'a', meta: 'm' },
      expected: { accent: 'a', meta: ' · m', empty: null, present: true },
    },
    {
      input: { accent: '  a  ' },
      expected: { accent: 'a', meta: null, empty: null, present: true },
    },
    {
      input: { meta: 'm', emptyMeta: 'e' },
      expected: { accent: null, meta: 'm', empty: null, present: true },
    },
    {
      input: { emptyMeta: 'e' },
      expected: { accent: null, meta: null, empty: 'e', present: true },
    },
    {
      input: { accent: '   ', meta: '' },
      expected: { accent: null, meta: null, empty: null, present: false },
    },
  ])('resolves $input', ({ input, expected }) => {
    expect(resolvePersonRowAffiliation(input)).toEqual(expected);
  });
});
