import { describe, expect, it } from 'vitest';
import type { ClaimScreenView } from './claim-screen-view';
import { claimScreenViewOf } from './claim-screen-view';
import type { WindowClaimResult } from './schemas';

describe('claimScreenViewOf', () => {
  it.each<[boolean | null, WindowClaimResult | undefined, ClaimScreenView]>([
    [null, undefined, { kind: 'checking' }],
    [true, undefined, { kind: 'form' }],
    [false, undefined, { kind: 'closed' }],
    [true, { outcome: 'invited', token: 'abc' }, { kind: 'entering' }],
    [true, { outcome: 'closed', token: null }, { kind: 'closed' }],
    [true, { outcome: 'notFound', token: null }, { kind: 'answer', answer: 'notFound' }],
    [null, { outcome: 'hasEmail', token: null }, { kind: 'answer', answer: 'hasEmail' }],
    [false, { outcome: 'underAge', token: null }, { kind: 'answer', answer: 'underAge' }],
  ])('open %s with %o shows %o', (isOpen, result, expected) => {
    expect(claimScreenViewOf(isOpen, result)).toEqual(expected);
  });
});
