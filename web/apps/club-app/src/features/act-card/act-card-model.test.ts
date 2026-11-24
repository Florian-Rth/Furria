import { describe, expect, it } from 'vitest';
import { isOwed } from './act-card-model';

describe('answers', () => {
  it.each([
    [true, null, true],
    [true, 'yes', false],
  ] as const)('owes an answer when in cast %s with %s', (inCast, answer, owed) => {
    expect(isOwed(inCast, answer)).toBe(owed);
  });
});
