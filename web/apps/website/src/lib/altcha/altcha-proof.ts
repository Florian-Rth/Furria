import type { Solution } from 'altcha/lib';
import { ApiError } from '@/lib/api/errors';
import type { AltchaChallenge } from './schemas';

export interface AltchaProof {
  payload: string;
  expiresAt: number;
}

export const ALTCHA_FIELD = 'altcha';

export const PROOF_REFRESH_MARGIN_MS = 60_000;

const MILLISECONDS_PER_SECOND = 1_000;

const FIELD_FAILURE_STATUS = 400;

export const encodeAltchaPayload = (challenge: AltchaChallenge, solution: Solution): string =>
  btoa(
    JSON.stringify({
      challenge: { parameters: challenge.parameters, signature: challenge.signature },
      solution,
    }),
  );

export const proofFreshFor = (proof: AltchaProof | undefined, solvedAt: number): number =>
  proof === undefined
    ? 0
    : Math.max(0, proof.expiresAt * MILLISECONDS_PER_SECOND - PROOF_REFRESH_MARGIN_MS - solvedAt);

export const isProofRefusal = (error: Error): boolean =>
  error instanceof ApiError &&
  error.status === FIELD_FAILURE_STATUS &&
  error.failures.some((failure) => failure.field === ALTCHA_FIELD);
