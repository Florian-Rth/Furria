import { describe, expect, it } from 'vitest';
import { ApiError, RequestBlockedError } from '@/lib/api/errors';
import type { AltchaProof } from './altcha-proof';
import { isProofRefusal, PROOF_REFRESH_MARGIN_MS, proofFreshFor } from './altcha-proof';

const proof: AltchaProof = { payload: 'eyJ9', expiresAt: 1_800_000_600 };

const solvedAt = 1_800_000_000_000;

describe('proofFreshFor', () => {
  it('keeps a proof until a margin before its challenge expires', () => {
    expect(proofFreshFor(proof, solvedAt)).toBe(600_000 - PROOF_REFRESH_MARGIN_MS);
  });

  it.each([
    ['inside the margin', solvedAt + 600_000 - PROOF_REFRESH_MARGIN_MS + 1],
    ['after the expiry', solvedAt + 900_000],
  ])('counts a proof solved %s as stale at once', (_when, at) => {
    expect(proofFreshFor(proof, at)).toBe(0);
  });

  it('has nothing to keep before a proof was solved', () => {
    expect(proofFreshFor(undefined, solvedAt)).toBe(0);
  });
});

describe('isProofRefusal', () => {
  it.each([
    [new ApiError(400, [{ field: 'altcha', message: 'abgelaufen' }]), true],
    [new ApiError(400, [{ field: 'email', message: 'ungültig' }]), false],
    [new ApiError(422, [{ field: 'altcha', message: 'abgelaufen' }]), false],
    [new ApiError(429), false],
    [new RequestBlockedError(), false],
  ])('tells a refused proof from any other failure: %s', (error, expected) => {
    expect(isProofRefusal(error)).toBe(expected);
  });
});
