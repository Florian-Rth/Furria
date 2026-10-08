import { describe, expect, it } from 'vitest';
import { readConfirmationToken } from './confirmation-token';

describe('readConfirmationToken', () => {
  it.each([
    ['#token=Ab3_-x9', 'Ab3_-x9'],
    ['token=Ab3_-x9', 'Ab3_-x9'],
    ['#token=%20Ab3%20', 'Ab3'],
  ])('reads the token out of %j', (fragment, expected) => {
    expect(readConfirmationToken(fragment)).toBe(expected);
  });

  it.each([[''], ['#token=abc.def'], ['#code=Ab3']])('finds no usable token in %j', (fragment) => {
    expect(readConfirmationToken(fragment)).toBeNull();
  });
});
