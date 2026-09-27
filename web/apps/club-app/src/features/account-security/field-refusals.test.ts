import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError } from '@/lib/api/api-error';
import { refusesField, toFieldRefusals } from './field-refusals';

const NAMES = ['code', 'loginEmail'] as const;

describe('toFieldRefusals', () => {
  it.each([
    [
      'a wrong code',
      new RequestFailedError(400, [{ field: 'code', message: 'Der Code stimmt nicht.' }]),
      [{ name: 'code', message: 'Der Code stimmt nicht.' }],
      null,
    ],
    [
      'a taken address',
      new RequestFailedError(409, [{ field: 'LoginEmail', message: 'Vergeben.' }]),
      [{ name: 'loginEmail', message: 'Vergeben.' }],
      null,
    ],
    [
      'a refusal on a field the form does not show',
      new RequestFailedError(400, [{ field: 'request', message: 'Abgelehnt.' }]),
      [],
      'Abgelehnt.',
    ],
  ])('places %s on its field', (_case, error, fields, footer) => {
    expect(toFieldRefusals(error, NAMES)).toEqual({ fields, footer });
  });

  it.each([
    ['a request that never left', new RequestBlockedError()],
    ['an unprocessable request', new RequestFailedError(422, [{ field: 'code', message: 'X' }])],
  ])('keeps %s off every field', (_case, error) => {
    const refusals = toFieldRefusals(error, NAMES);

    expect(refusals.fields).toEqual([]);
    expect(refusals.footer).not.toBeNull();
  });
});

describe('refusesField', () => {
  it.each([
    ['the refused field', 'loginEmail' as const, true],
    ['another field', 'code' as const, false],
  ])('reports %s as refused: %s', (_case, name, expected) => {
    const refusals = {
      fields: [{ name: 'loginEmail' as const, message: 'Vergeben.' }],
      footer: null,
    };

    expect(refusesField(refusals, name)).toBe(expected);
  });
});
