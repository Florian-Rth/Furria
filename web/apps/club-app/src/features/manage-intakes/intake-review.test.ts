import { describe, expect, it } from 'vitest';
import { NEW_PERSON_CHOICE, toReviewResolution } from './intake-review';

describe('toReviewResolution', () => {
  it.each([
    [NEW_PERSON_CHOICE, { kind: 'newPerson' }],
    ['42', { kind: 'existingPerson', personId: 42 }],
    ['nonsense', { kind: 'invalid' }],
    [null, { kind: 'invalid' }],
  ] as const)('resolves choice %s', (choice, expected) => {
    expect(toReviewResolution(choice)).toEqual(expected);
  });
});
