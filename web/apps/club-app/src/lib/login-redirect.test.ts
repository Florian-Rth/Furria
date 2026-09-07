import { describe, expect, it } from 'vitest';
import { buildLoginSearch, type LoginSearch } from './login-redirect';

describe('buildLoginSearch', () => {
  it.each<[string, string, boolean, LoginSearch]>([
    ['the app root without an expiry', '/', false, {}],
    ['the app root after an expiry', '/', true, { expired: 1 }],
    [
      'a deep page without an expiry',
      '/beitrag?jahr=2026',
      false,
      { returnTo: '/beitrag?jahr=2026' },
    ],
    ['a deep page after an expiry', '/beitrag', true, { returnTo: '/beitrag', expired: 1 }],
  ])('builds the login search for %s', (_case, returnTo, expired, expected) => {
    expect(buildLoginSearch(returnTo, expired)).toEqual(expected);
  });
});
