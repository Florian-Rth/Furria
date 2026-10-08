import { describe, expect, it } from 'vitest';
import { ApiError, RequestBlockedError } from '@/lib/api/errors';
import type { TicketRequestFailure } from './ticket-request-failure';
import { toTicketRequestFailure } from './ticket-request-failure';

describe('toTicketRequestFailure', () => {
  it.each<[string, Error | null, TicketRequestFailure | null]>([
    ['nothing failed', null, null],
    [
      'a request that never left the browser',
      new RequestBlockedError(),
      { fields: [], noticeKind: 'blocked', offersMail: true, closesWindow: false },
    ],
    [
      'a server failure',
      new ApiError(503),
      { fields: [], noticeKind: 'unavailable', offersMail: true, closesWindow: false },
    ],
    [
      'an unexpected error',
      new Error('boom'),
      { fields: [], noticeKind: 'unavailable', offersMail: true, closesWindow: false },
    ],
    [
      'field failures the form does not know',
      new ApiError(400, [{ field: 'eventId', message: 'x' }]),
      { fields: [], noticeKind: 'unavailable', offersMail: true, closesWindow: false },
    ],
    [
      'a proof refused twice',
      new ApiError(400, [{ field: 'altcha', message: 'abgelaufen' }]),
      { fields: [], noticeKind: 'proofRefused', offersMail: true, closesWindow: false },
    ],
    [
      'the rate limit',
      new ApiError(429),
      { fields: [], noticeKind: 'rateLimited', offersMail: false, closesWindow: false },
    ],
    [
      'the window closed meanwhile',
      new ApiError(409),
      { fields: [], noticeKind: 'closed', offersMail: false, closesWindow: true },
    ],
    [
      'the evening is gone',
      new ApiError(404),
      { fields: [], noticeKind: 'gone', offersMail: false, closesWindow: true },
    ],
    [
      'field refusals the form knows, the consent included',
      new ApiError(400, [
        { field: 'phone', message: 'Telefon prüfen.' },
        { field: 'consentAccepted', message: 'Einwilligung fehlt.' },
      ]),
      {
        fields: [
          { name: 'phone', message: 'Telefon prüfen.' },
          { name: 'consent', message: 'Einwilligung fehlt.' },
        ],
        noticeKind: null,
        offersMail: false,
        closesWindow: false,
      },
    ],
  ])('answers %s', (_, error, failure) => {
    expect(toTicketRequestFailure(error)).toEqual(failure);
  });
});
