import { describe, expect, it } from 'vitest';
import type { LandingTarget } from './landing-target';
import { parseLandingKey } from './landing-target';

describe('parseLandingKey', () => {
  it.each<{ label: string; key: string | undefined; expected: LandingTarget | null }>([
    { label: 'nothing at all', key: undefined, expected: null },
    {
      label: 'a well-formed key',
      key: 'membership:42',
      expected: { kind: 'membership', id: '42' },
    },
    {
      label: 'an id that itself contains the separator',
      key: 'membership:42:1',
      expected: { kind: 'membership', id: '42:1' },
    },
    { label: 'no separator at all', key: 'membership', expected: null },
    { label: 'an empty kind', key: ':42', expected: null },
    { label: 'an empty id', key: 'membership:', expected: null },
  ])('resolves $label', ({ key, expected }) => {
    expect(parseLandingKey(key)).toEqual(expected);
  });
});
