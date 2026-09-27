import { describe, expect, it } from 'vitest';
import { LoginEmailCodeFormSchema, LoginEmailFormSchema, toConfirmationDigits } from './schemas';

describe('LoginEmailFormSchema', () => {
  it('trims the typed address', () => {
    expect(
      LoginEmailFormSchema.parse({ loginEmail: '  anna@web.de ', updateContactEmail: false }),
    ).toEqual({ loginEmail: 'anna@web.de', updateContactEmail: false });
  });
});

describe('toConfirmationDigits', () => {
  it.each([
    ['a plain code', '482913', '482913'],
    ['a code typed in two groups', '482 913', '482913'],
    ['a code pasted with a dash and spaces', ' 48-29 13 ', '482913'],
  ])('keeps only the digits of %s', (_case, typed, expected) => {
    expect(toConfirmationDigits(typed)).toBe(expected);
  });
});

describe('LoginEmailCodeFormSchema', () => {
  it.each([
    ['a code typed in two groups', '482 913', true],
    ['a code one digit short', '48291', false],
  ])('accepts %s: %s', (_case, code, expected) => {
    expect(LoginEmailCodeFormSchema.safeParse({ code }).success).toBe(expected);
  });
});
