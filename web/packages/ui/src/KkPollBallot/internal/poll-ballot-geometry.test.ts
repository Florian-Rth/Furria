import { describe, expect, it } from 'vitest';
import { toBallotBarWidth } from './poll-ballot-geometry';

describe('toBallotBarWidth', () => {
  it.each([
    [-5, '0%'],
    [0, '0%'],
    [42, '42%'],
    [100, '100%'],
    [130, '100%'],
  ])('draws %i percent as %s', (percent, expected) => {
    expect(toBallotBarWidth(percent)).toBe(expected);
  });
});
