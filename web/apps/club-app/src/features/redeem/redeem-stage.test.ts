import { describe, expect, it } from 'vitest';
import { needsEmailConfirmation } from './redeem-stage';

describe('needsEmailConfirmation', () => {
  it.each<[string, string, string | null, boolean]>([
    ['the suggested address in other case and with blanks', ' Anna@Web.de ', 'anna@web.de', false],
    ['another address', 'anna@privat.de', 'anna@web.de', true],
  ])('decides for %s', (_case, typed, suggested, expected) => {
    expect(needsEmailConfirmation(typed, suggested)).toBe(expected);
  });
});
