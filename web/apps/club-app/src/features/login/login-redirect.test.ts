import { describe, expect, it } from 'vitest';
import { buildLoginSearch } from './login-redirect';
import type { LoginSearch } from './schemas';

describe('buildLoginSearch', () => {
  it.each<[string, string | undefined, boolean, LoginSearch]>([
    ['a missing target without an expiry', undefined, false, {}],
    ['the app root without an expiry', '/', false, {}],
    ['the app root after an expiry', '/', true, { expired: 1 }],
    [
      'a deep page without an expiry',
      '/beitrag?jahr=2026',
      false,
      { returnTo: '/beitrag?jahr=2026' },
    ],
    ['a deep page after an expiry', '/beitrag', true, { returnTo: '/beitrag', expired: 1 }],
    ['the login page itself', '/login', false, {}],
    ['the login page with a nested target', '/login?returnTo=%2Fbeitrag', true, { expired: 1 }],
    ['an absolute foreign target', 'https://evil.example/beitrag', false, {}],
  ])('builds the login search for %s', (_case, returnTo, expired, expected) => {
    expect(buildLoginSearch(returnTo, expired)).toEqual(expected);
  });
});
