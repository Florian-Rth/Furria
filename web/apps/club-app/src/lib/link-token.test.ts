import { describe, expect, it } from 'vitest';
import { tokenOfHash } from './link-token';

const TOKEN = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJK_-0123';

describe('tokenOfHash', () => {
  it.each([
    { label: 'a token behind the hash sign', hash: `#${TOKEN}`, expected: TOKEN },
    { label: 'a cut-off token', hash: `#${TOKEN.slice(0, 20)}`, expected: null },
    { label: 'a token with foreign characters', hash: `#${TOKEN.slice(0, 42)}!`, expected: null },
  ])('reads $label', ({ hash, expected }) => {
    expect(tokenOfHash(hash)).toBe(expected);
  });
});
