import { describe, expect, it } from 'vitest';
import { ApiError, RequestBlockedError } from '@/lib/api/errors';
import type { AltchaProof } from './altcha-proof';
import { isProofRefusal, PROOF_REFRESH_MARGIN_MS, proofFreshFor } from './altcha-proof';

const proof: AltchaProof = { payload: 'eyJ9', expiresAt: 1_800_000_600 };

const solvedAt = 1_800_000_000_000;

describe('proofFreshFor', () => {
  it.each<[string, AltchaProof | undefined, number, number]>([
    ['just solved', proof, solvedAt, 600_000 - PROOF_REFRESH_MARGIN_MS],
    ['inside the margin', proof, solvedAt + 600_000 - PROOF_REFRESH_MARGIN_MS + 1, 0],
    ['after the expiry', proof, solvedAt + 900_000, 0],
    ['never solved', undefined, solvedAt, 0],
  ])('keeps a proof %s fresh for the right time', (_, subject, at, freshFor) => {
    expect(proofFreshFor(subject, at)).toBe(freshFor);
  });
});

describe('isProofRefusal', () => {
  it.each([
    [new ApiError(400, [{ field: 'altcha', message: 'abgelaufen' }]), true],
    [new ApiError(400, [{ field: 'email', message: 'ungültig' }]), false],
    [new ApiError(422, [{ field: 'altcha', message: 'abgelaufen' }]), false],
    [new RequestBlockedError(), false],
  ])('tells a refused proof from any other failure: %s', (error, expected) => {
    expect(isProofRefusal(error)).toBe(expected);
  });
});
