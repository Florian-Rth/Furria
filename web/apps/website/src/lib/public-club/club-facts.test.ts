import { describe, expect, it } from 'vitest';
import { formatMemberCount } from './club-facts';

describe('formatMemberCount', () => {
  it.each([
    [0, '0'],
    [9, '9'],
    [10, '10+'],
    [180, '180+'],
    [189, '180+'],
    [1203, '1200+'],
  ])('prints %i members as %s', (memberCount, expected) => {
    expect(formatMemberCount(memberCount)).toBe(expected);
  });
});
