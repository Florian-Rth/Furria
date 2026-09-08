import { describe, expect, it } from 'vitest';
import type { LoginSearch } from './schemas';
import { LoginSearchSchema } from './schemas';

type RawSearch = Record<string, string | number | boolean>;

describe('LoginSearchSchema', () => {
  it.each<[string, RawSearch, LoginSearch]>([
    ['an empty search', {}, { returnTo: undefined, expired: undefined }],
    ['the expiry marker', { expired: 1 }, { returnTo: undefined, expired: 1 }],
    ['a boolean expiry marker', { expired: false }, { returnTo: undefined, expired: undefined }],
    ['a truthy expiry marker', { expired: true }, { returnTo: undefined, expired: undefined }],
    ['a numeric return target', { returnTo: 1 }, { returnTo: undefined, expired: undefined }],
    [
      'a relative return target',
      { returnTo: '/beitrag' },
      { returnTo: '/beitrag', expired: undefined },
    ],
    [
      'a foreign return target',
      { returnTo: 'https://evil.example' },
      { returnTo: undefined, expired: undefined },
    ],
    [
      'a nested login target',
      { returnTo: '/login?returnTo=%2Fbeitrag', expired: 1 },
      { returnTo: undefined, expired: 1 },
    ],
  ])('normalises %s', (_case, raw, expected) => {
    expect(LoginSearchSchema.parse(raw)).toEqual(expected);
  });
});

describe('LoginSearchSchema round trip', () => {
  it.each([
    [{}],
    [{ expired: 1 }],
    [{ expired: false }],
    [{ returnTo: '/beitrag', expired: 1 }],
    [{ returnTo: '/login' }],
    [{ returnTo: 7 }],
  ])('parses its own output for %o unchanged', (raw) => {
    const once = LoginSearchSchema.parse(raw);
    expect(LoginSearchSchema.parse(once)).toEqual(once);
  });
});
