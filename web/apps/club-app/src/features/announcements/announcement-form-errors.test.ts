import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import { toAnnouncementFieldErrors } from './announcement-form-errors';

describe('toAnnouncementFieldErrors', () => {
  it.each([
    { case: 'nothing went wrong', error: null, expected: [] },
    { case: 'the request never left', error: new RequestBlockedError(), expected: [] },
    { case: 'the server broke', error: new ServerFailureError(500), expected: [] },
    {
      case: 'the row was gone',
      error: new ServerFailureError(404),
      expected: [],
    },
    {
      case: 'a conflict names no form field',
      error: new RequestFailedError(409, [{ field: 'Title', message: 'Hängt schon.' }]),
      expected: [],
    },
    {
      case: 'the validator rejected the title with 422',
      error: new RequestFailedError(422, [{ field: 'Title', message: 'Zu lang.' }]),
      expected: [{ field: 'title', message: 'Zu lang.' }],
    },
    {
      case: 'the validator rejected the body with 400',
      error: new RequestFailedError(400, [{ field: 'Body', message: 'Fehlt.' }]),
      expected: [{ field: 'body', message: 'Fehlt.' }],
    },
    {
      case: 'the route param is named alongside a form field',
      error: new RequestFailedError(422, [
        { field: 'AnnouncementId', message: 'Unbekannt.' },
        { field: 'ValidUntil', message: 'Kein Datum.' },
      ]),
      expected: [{ field: 'validUntil', message: 'Kein Datum.' }],
    },
  ])('returns $expected when $case', ({ error, expected }) => {
    expect(toAnnouncementFieldErrors(error)).toEqual(expected);
  });
});
