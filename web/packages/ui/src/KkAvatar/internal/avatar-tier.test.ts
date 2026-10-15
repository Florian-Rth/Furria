import { describe, expect, it } from 'vitest';
import { ringedSizeOf } from './avatar-tier';

describe('ringedSizeOf', () => {
  const honours = { sessions: 3, functions: [] };
  const standing = { membership: 'running', app: 'active', feeReduced: false } as const;

  it.each([
    ['small', honours, standing, null],
    ['medium', undefined, undefined, null],
    ['medium', honours, undefined, 'medium'],
    ['large', undefined, standing, 'large'],
    ['header', honours, standing, 'header'],
    ['portrait', honours, undefined, 'portrait'],
  ] as const)('rings a %s avatar', (size, given, standingGiven, ringed) => {
    expect(ringedSizeOf(size, given, standingGiven)).toBe(ringed);
  });
});
