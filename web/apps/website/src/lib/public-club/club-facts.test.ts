import { describe, expect, it } from 'vitest';
import { formatMemberCount } from './club-facts';

describe('formatMemberCount', () => {
  it.each([
    [9, '9'],
    [10, '10+'],
    [189, '180+'],
  ])('prints %i members as %s', (memberCount, expected) => {
    expect(formatMemberCount(memberCount)).toBe(expected);
  });
});
