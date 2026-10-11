import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError, UnauthorizedError } from '@/lib/api/api-error';
import type { WriteFieldFailure } from './write-failure';
import { toWriteFailure } from './write-failure';

const NAMES = ['name', 'permissions', 'loginEmail'] as const;

type Name = (typeof NAMES)[number];

describe('toWriteFailure', () => {
  it.each<{
    label: string;
    error: RequestFailedError;
    fields: WriteFieldFailure<Name>[];
    footer: string | null;
  }>([
    {
      label: 'a validation failure on a shown field',
      error: new RequestFailedError(400, [{ field: 'Name', message: 'name-failure' }]),
      fields: [{ name: 'name', message: 'name-failure' }],
      footer: null,
    },
    {
      label: 'a conflict that names a shown field',
      error: new RequestFailedError(409, [{ field: 'LoginEmail', message: 'taken' }]),
      fields: [{ name: 'loginEmail', message: 'taken' }],
      footer: null,
    },
    {
      label: 'a business refusal that names a shown field',
      error: new RequestFailedError(422, [{ field: 'name', message: 'too-long' }]),
      fields: [{ name: 'name', message: 'too-long' }],
      footer: null,
    },
    {
      label: 'an indexed failure on a list field',
      error: new RequestFailedError(400, [{ field: 'Permissions[2]', message: 'unknown-key' }]),
      fields: [{ name: 'permissions', message: 'unknown-key' }],
      footer: null,
    },
    {
      label: 'a failure on a field the form does not show',
      error: new RequestFailedError(400, [
        { field: 'GroupId', message: 'group-failure' },
        { field: 'Name', message: 'name-failure' },
        { field: 'generalErrors', message: 'general-failure' },
      ]),
      fields: [{ name: 'name', message: 'name-failure' }],
      footer: 'group-failure',
    },
    {
      label: 'a conflict that names no field at all',
      error: new RequestFailedError(409, [{ field: 'request', message: 'conflict' }]),
      fields: [],
      footer: 'conflict',
    },
  ])('places $label', ({ error, fields, footer }) => {
    expect(toWriteFailure(error, NAMES)).toEqual({ fields, footer });
  });

  it.each([
    { label: 'a request that never left', error: new RequestBlockedError() },
    { label: 'a refusal without any failure', error: new RequestFailedError(409, []) },
  ])('keeps $label off every field but tells it in the footer', ({ error }) => {
    const failure = toWriteFailure(error, NAMES);

    expect(failure.fields).toEqual([]);
    expect(failure.footer).not.toBeNull();
  });

  it('stays silent on an expired session the shell already handles', () => {
    expect(toWriteFailure(new UnauthorizedError(), NAMES)).toEqual({ fields: [], footer: null });
  });
});
