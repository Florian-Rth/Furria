import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import type { ApplyFailure } from './apply-failure';
import { toApplyFailure } from './apply-failure';

describe('toApplyFailure', () => {
  it.each<[string, Error | null, ApplyFailure | null]>([
    ['nothing failed', null, null],
    [
      'a request that never left the browser',
      new ApiError({ kind: 'unreachable' }),
      { fields: [], noticeKind: 'blocked', offersMail: true },
    ],
    [
      'a server failure',
      new ApiError({ kind: 'status', status: 503 }),
      { fields: [], noticeKind: 'unavailable', offersMail: true },
    ],
    [
      'an unexpected error',
      new Error('boom'),
      { fields: [], noticeKind: 'unavailable', offersMail: true },
    ],
    [
      'a refusal without a reason',
      new ApiError({ kind: 'status', status: 422 }),
      { fields: [], noticeKind: 'unavailable', offersMail: true },
    ],
    [
      'a proof refused twice',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'altcha', message: 'abgelaufen' }],
      }),
      { fields: [], noticeKind: 'proofRefused', offersMail: true },
    ],
    [
      'the rate limit',
      new ApiError({ kind: 'throttled' }),
      { fields: [], noticeKind: 'rateLimited', offersMail: false },
    ],
    [
      'the club refusing the birth date',
      new ApiError({
        kind: 'refused',
        status: 422,
        fields: [{ field: 'request', message: 'Mindestens 16.' }],
      }),
      {
        fields: [{ name: 'birthDate', message: 'Mindestens 16.' }],
        noticeKind: null,
        offersMail: false,
      },
    ],
    [
      'field failures, keeping only the fields the applicant typed in',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [
          { field: 'email', message: 'Keine Adresse.' },
          { field: 'consentAccepted', message: 'Fehlt.' },
          { field: 'generalErrors', message: 'Unbekannt.' },
        ],
      }),
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
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'generalErrors', message: 'x' }],
      }),
      { fields: [], noticeKind: 'unavailable', offersMail: true },
    ],
  ])('answers %s', (_, error, failure) => {
    expect(toApplyFailure(error)).toEqual(failure);
  });
});
