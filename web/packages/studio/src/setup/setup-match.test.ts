import { matchPhaseOf } from '@furria/studio/setup-match';
import { describe, expect, it } from 'vitest';

const facts = { chosen: true, ready: true, aligning: false, placed: true, searchFailed: false };

describe('matchPhaseOf', () => {
  it.each([
    [{ ...facts, chosen: false }, 'none'],
    [{ ...facts, ready: false, placed: false }, 'waiting'],
    [{ ...facts, aligning: true }, 'searching'],
    [{ ...facts, aligning: true, placed: false }, 'searching'],
    [facts, 'check'],
    [{ ...facts, searchFailed: true }, 'check'],
    [{ ...facts, placed: false }, 'missing'],
    [{ ...facts, placed: false, searchFailed: true }, 'failed'],
  ] as const)('%o → %s', (shown, phase) => {
    expect(matchPhaseOf(shown)).toBe(phase);
  });
});
