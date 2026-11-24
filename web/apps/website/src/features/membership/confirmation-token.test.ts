import { describe, expect, it } from 'vitest';
import { readConfirmationToken } from './confirmation-token';

describe('readConfirmationToken', () => {
  it.each([['#token=abc.def'], ['#code=Ab3']])('finds no usable token in %j', (fragment) => {
    expect(readConfirmationToken(fragment)).toBeNull();
  });
});
