import { describe, expect, it } from 'vitest';
import type { LoginSearch } from './schemas';
import { LoginSearchSchema } from './schemas';

type RawSearch = Record<string, string | number | boolean>;

describe('LoginSearchSchema', () => {
  it.each<[string, RawSearch, LoginSearch]>([
    ['an empty search', {}, { returnTo: undefined, expired: undefined }],
    ['the expiry marker', { expired: 1 }, { returnTo: undefined, expired: 1 }],
    ['a truthy expiry marker', { expired: true }, { returnTo: undefined, expired: undefined }],
    ['the password reset marker', { passwordReset: 1 }, { passwordReset: 1 }],
    ['a foreign password reset marker', { passwordReset: 2 }, { passwordReset: undefined }],
    ['a numeric return target', { returnTo: 1 }, { returnTo: undefined, expired: undefined }],
    [
      'a relative return target',
      { returnTo: '/beitrag' },
      { returnTo: '/beitrag', expired: undefined },
    ],
  ])('normalises %s', (_case, raw, expected) => {
    expect(LoginSearchSchema.parse(raw)).toEqual(expected);
  });
});

describe('LoginSearchSchema round trip', () => {
  it.each([[{ expired: false }], [{ returnTo: '/beitrag', expired: 1 }], [{ returnTo: 7 }]])(
    'parses its own output for %o unchanged',
    (raw) => {
      const once = LoginSearchSchema.parse(raw);
      expect(LoginSearchSchema.parse(once)).toEqual(once);
    },
  );
});
