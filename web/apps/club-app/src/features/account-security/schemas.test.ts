import { describe, expect, it } from 'vitest';
import { LoginEmailCodeFormSchema } from './schemas';

describe('LoginEmailCodeFormSchema', () => {
  it.each([
    ['a code pasted with a dash and spaces', ' 48-29 13 ', true],
    ['a code one digit short', '48291', false],
  ])('accepts %s: %s', (_case, code, expected) => {
    expect(LoginEmailCodeFormSchema.safeParse({ code }).success).toBe(expected);
  });
});
