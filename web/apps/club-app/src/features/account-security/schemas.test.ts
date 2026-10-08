import { describe, expect, it } from 'vitest';
import { LoginEmailCodeFormSchema, LoginEmailFormSchema } from './schemas';

describe('LoginEmailFormSchema', () => {
  it('trims the typed address', () => {
    expect(
      LoginEmailFormSchema.parse({ loginEmail: '  anna@web.de ', updateContactEmail: false }),
    ).toEqual({ loginEmail: 'anna@web.de', updateContactEmail: false });
  });
});

describe('LoginEmailCodeFormSchema', () => {
  it.each([
    ['a code pasted with a dash and spaces', ' 48-29 13 ', true],
    ['a code one digit short', '48291', false],
  ])('accepts %s: %s', (_case, code, expected) => {
    expect(LoginEmailCodeFormSchema.safeParse({ code }).success).toBe(expected);
  });
});
