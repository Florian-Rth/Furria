import { describe, expect, it } from 'vitest';
import { ApiError, RequestBlockedError } from '@/lib/api/errors';
import type { ApplyFailure } from './apply-failure';
import { toApplyFailure } from './apply-failure';

describe('toApplyFailure', () => {
  it.each<[string, Error | null, ApplyFailure | null]>([
    ['nothing failed', null, null],
    [
      'a request that never left the browser',
      new RequestBlockedError(),
      { fields: [], noticeKind: 'blocked', offersMail: true },
    ],
    [
      'a server failure',
      new ApiError(503),
      { fields: [], noticeKind: 'unavailable', offersMail: true },
    ],
    [
      'an unexpected error',
      new Error('boom'),
      { fields: [], noticeKind: 'unavailable', offersMail: true },
    ],
    [
      'a refusal without a reason',
      new ApiError(422),
      { fields: [], noticeKind: 'unavailable', offersMail: true },
    ],
    [
      'a proof refused twice',
      new ApiError(400, [{ field: 'altcha', message: 'abgelaufen' }]),
      { fields: [], noticeKind: 'proofRefused', offersMail: true },
    ],
    [
      'the rate limit',
      new ApiError(429),
      { fields: [], noticeKind: 'rateLimited', offersMail: false },
    ],
    [
      'the club refusing the birth date',
      new ApiError(422, [{ field: 'request', message: 'Mindestens 16.' }]),
      {
        fields: [{ name: 'birthDate', message: 'Mindestens 16.' }],
        noticeKind: null,
        offersMail: false,
      },
    ],
    [
      'field failures, keeping only the fields the applicant typed in',
      new ApiError(400, [
        { field: 'email', message: 'Keine Adresse.' },
        { field: 'consentAccepted', message: 'Fehlt.' },
        { field: 'generalErrors', message: 'Unbekannt.' },
      ]),
      {
        fields: [
          { name: 'email', message: 'Keine Adresse.' },
          { name: 'consent', message: 'Fehlt.' },
        ],
        noticeKind: null,
        offersMail: false,
      },
    ],
    [
      'field failures the form does not know',
      new ApiError(400, [{ field: 'generalErrors', message: 'x' }]),
      { fields: [], noticeKind: 'unavailable', offersMail: true },
    ],
  ])('answers %s', (_, error, failure) => {
    expect(toApplyFailure(error)).toEqual(failure);
  });
});
