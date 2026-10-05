import { describe, expect, it } from 'vitest';
import { ApiError, RequestBlockedError } from '@/lib/api/errors';
import { toApplyFailure } from './apply-failure';

describe('toApplyFailure', () => {
  it('stays quiet while nothing failed', () => {
    expect(toApplyFailure(null)).toBeNull();
  });

  it.each([
    ['a request that never left the browser', new RequestBlockedError()],
    ['a server failure', new ApiError(503)],
    ['a missing endpoint', new ApiError(404)],
    ['an unexpected error', new Error('boom')],
    ['a refusal without a reason', new ApiError(422)],
    [
      'field failures the form does not know',
      new ApiError(400, [{ field: 'generalErrors', message: 'x' }]),
    ],
    ['a proof refused twice', new ApiError(400, [{ field: 'altcha', message: 'abgelaufen' }])],
  ])('offers the mail fallback after %s', (_case, error) => {
    const failure = toApplyFailure(error);

    expect(failure?.fields).toEqual([]);
    expect(failure?.notice).not.toBeNull();
    expect(failure?.offersMail).toBe(true);
  });

  it('asks to wait instead of offering a way around the rate limit', () => {
    const failure = toApplyFailure(new ApiError(429));

    expect(failure?.notice).not.toBeNull();
    expect(failure?.offersMail).toBe(false);
  });

  it('puts the club’s refusal of the birth date on the birth date', () => {
    const failure = toApplyFailure(
      new ApiError(422, [{ field: 'request', message: 'Mindestens 16.' }]),
    );

    expect(failure).toEqual({
      fields: [{ name: 'birthDate', message: 'Mindestens 16.' }],
      notice: null,
      offersMail: false,
    });
  });

  it('puts every field failure on the field the applicant typed it in', () => {
    const failure = toApplyFailure(
      new ApiError(400, [
        { field: 'email', message: 'Keine Adresse.' },
        { field: 'consentAccepted', message: 'Fehlt.' },
        { field: 'generalErrors', message: 'Unbekannt.' },
      ]),
    );

    expect(failure).toEqual({
      fields: [
        { name: 'email', message: 'Keine Adresse.' },
        { name: 'consent', message: 'Fehlt.' },
      ],
      notice: null,
      offersMail: false,
    });
  });
});
