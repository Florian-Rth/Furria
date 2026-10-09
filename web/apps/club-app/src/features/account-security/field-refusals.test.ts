import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { toFieldRefusals } from './field-refusals';

const NAMES = ['code', 'loginEmail'] as const;

describe('toFieldRefusals', () => {
  it.each([
    [
      'a wrong code',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'code', message: 'Der Code stimmt nicht.' }],
      }),
      [{ name: 'code', message: 'Der Code stimmt nicht.' }],
      null,
    ],
    [
      'a taken address',
      new ApiError({
        kind: 'refused',
        status: 409,
        fields: [{ field: 'loginEmail', message: 'Vergeben.' }],
      }),
      [{ name: 'loginEmail', message: 'Vergeben.' }],
      null,
    ],
    [
      'a refusal on a field the form does not show',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'request', message: 'Abgelehnt.' }],
      }),
      [],
      'Abgelehnt.',
    ],
  ])('places %s on its field', (_case, error, fields, footer) => {
    expect(toFieldRefusals(error, NAMES)).toEqual({ fields, footer });
  });

  it.each([
    ['a request that never left', new ApiError({ kind: 'unreachable' })],
    [
      'an unprocessable request',
      new ApiError({ kind: 'refused', status: 422, fields: [{ field: 'code', message: 'X' }] }),
    ],
  ])('keeps %s off every field', (_case, error) => {
    const refusals = toFieldRefusals(error, NAMES);

    expect(refusals.fields).toEqual([]);
    expect(refusals.footer).not.toBeNull();
  });
});
