import { describe, expect, it } from 'vitest';
import { RedeemFormSchema } from './schemas';

describe('RedeemFormSchema', () => {
  it('trims the login email', () => {
    expect(
      RedeemFormSchema.parse({ loginEmail: '  anna@web.de ', password: 'Neues-Passwort-2026!' })
        .loginEmail,
    ).toBe('anna@web.de');
  });
});
