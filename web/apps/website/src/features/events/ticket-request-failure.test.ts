import { describe, expect, it } from 'vitest';
import { ApiError, RequestBlockedError } from '@/lib/api/errors';
import { toTicketRequestFailure } from './ticket-request-failure';

describe('toTicketRequestFailure', () => {
  it('stays quiet while nothing failed', () => {
    expect(toTicketRequestFailure(null)).toBeNull();
  });

  it.each([
    ['a request that never left the browser', new RequestBlockedError()],
    ['a server failure', new ApiError(503)],
    ['an unexpected error', new Error('boom')],
    [
      'field failures the form does not know',
      new ApiError(400, [{ field: 'eventId', message: 'x' }]),
    ],
    ['a proof refused twice', new ApiError(400, [{ field: 'altcha', message: 'abgelaufen' }])],
  ])('offers the mail fallback after %s', (_case, error) => {
    const failure = toTicketRequestFailure(error);

    expect(failure?.fields).toEqual([]);
    expect(failure?.notice).not.toBeNull();
    expect(failure?.offersMail).toBe(true);
    expect(failure?.closesWindow).toBe(false);
  });

  it('asks to wait instead of offering a way around the rate limit', () => {
    const failure = toTicketRequestFailure(new ApiError(429));

    expect(failure?.offersMail).toBe(false);
    expect(failure?.closesWindow).toBe(false);
  });

  it.each([
    ['the window closed meanwhile', new ApiError(409)],
    ['the evening is gone', new ApiError(404)],
  ])('closes the form without a way around when %s', (_case, error) => {
    const failure = toTicketRequestFailure(error);

    expect(failure?.offersMail).toBe(false);
    expect(failure?.closesWindow).toBe(true);
  });

  it('puts the server’s field refusals on the fields, the consent included', () => {
    const failure = toTicketRequestFailure(
      new ApiError(400, [
        { field: 'phone', message: 'Telefon prüfen.' },
        { field: 'consentAccepted', message: 'Einwilligung fehlt.' },
      ]),
    );

    expect(failure?.fields).toEqual([
      { name: 'phone', message: 'Telefon prüfen.' },
      { name: 'consent', message: 'Einwilligung fehlt.' },
    ]);
    expect(failure?.notice).toBeNull();
  });
});
