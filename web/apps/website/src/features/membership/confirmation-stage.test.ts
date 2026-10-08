import { describe, expect, it } from 'vitest';
import { ApiError, RequestBlockedError } from '@/lib/api/errors';
import type { ConfirmationStage } from './confirmation-stage';
import { resolveConfirmationStage } from './confirmation-stage';
import type { ConfirmationOutcome } from './schemas';

const TOKEN = 'Ab3_-x9';

describe('resolveConfirmationStage', () => {
  it.each<
    [
      string,
      string | null,
      ConfirmationOutcome | undefined,
      Error | null,
      boolean,
      ConfirmationStage,
    ]
  >([
    [
      'a link without a token',
      null,
      undefined,
      null,
      false,
      { kind: 'settled', verdict: 'incomplete' },
    ],
    ['a request on its way', TOKEN, undefined, null, true, { kind: 'confirming' }],
    [
      'a confirmed application',
      TOKEN,
      'confirmed',
      null,
      false,
      { kind: 'settled', verdict: 'confirmed' },
    ],
    [
      'a blocked request',
      TOKEN,
      undefined,
      new RequestBlockedError(),
      false,
      { kind: 'failed', failure: 'blocked' },
    ],
    [
      'a server failure',
      TOKEN,
      undefined,
      new ApiError(503),
      false,
      { kind: 'failed', failure: 'unavailable' },
    ],
    ['a retry after a failure', TOKEN, undefined, new ApiError(503), true, { kind: 'confirming' }],
  ])('settles %s', (_case, token, outcome, error, isConfirming, expected) => {
    expect(resolveConfirmationStage(token, outcome, error, isConfirming)).toEqual(expected);
  });
});
