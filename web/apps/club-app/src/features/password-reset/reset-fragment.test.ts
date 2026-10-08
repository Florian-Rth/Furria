import { describe, expect, it } from 'vitest';
import { readPasswordReset } from './reset-fragment';

describe('readPasswordReset', () => {
  it.each<[string, string, string | null]>([
    ['a fragment with its mark', '#reset=AAAAB3-_x9Q', 'AAAAB3-_x9Q'],
    ['a fragment without its mark', 'reset=AAAAB3-_x9Q', 'AAAAB3-_x9Q'],
    ['a reset of blanks', '#reset=%20%20', null],
    ['a reset with foreign characters', '#reset=ab%2Fcd', null],
    ['an invitation token instead', '#token=aB3-_x9Q', null],
  ])('reads %s', (_case, fragment, expected) => {
    expect(readPasswordReset(fragment)).toBe(expected);
  });
});
