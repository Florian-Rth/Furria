import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { toAnnouncementFieldErrors } from './announcement-form-errors';

describe('toAnnouncementFieldErrors', () => {
  it.each([
    { case: 'nothing went wrong', error: null, expected: [] },
    { case: 'the request never left', error: new ApiError({ kind: 'unreachable' }), expected: [] },
    {
      case: 'a conflict names no form field',
      error: new ApiError({
        kind: 'refused',
        status: 409,
        fields: [{ field: 'title', message: 'Hängt schon.' }],
      }),
      expected: [],
    },
    {
      case: 'the validator rejected the title with 422',
      error: new ApiError({
        kind: 'refused',
        status: 422,
        fields: [{ field: 'title', message: 'Zu lang.' }],
      }),
      expected: [{ field: 'title', message: 'Zu lang.' }],
    },
    {
      case: 'the validator rejected the body with 400',
      error: new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'body', message: 'Fehlt.' }],
      }),
      expected: [{ field: 'body', message: 'Fehlt.' }],
    },
    {
      case: 'the route param is named alongside a form field',
      error: new ApiError({
        kind: 'refused',
        status: 422,
        fields: [
          { field: 'announcementId', message: 'Unbekannt.' },
          { field: 'validUntil', message: 'Kein Datum.' },
        ],
      }),
      expected: [{ field: 'validUntil', message: 'Kein Datum.' }],
    },
  ])('returns $expected when $case', ({ error, expected }) => {
    expect(toAnnouncementFieldErrors(error)).toEqual(expected);
  });
});
