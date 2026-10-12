import type { ApiFieldFailure, RefusalStatus } from '@furria/api-client';
import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import type { WriteFieldFailure } from './write-failure';
import { toWriteFailure } from './write-failure';

const NAMES = ['name', 'permissions', 'loginEmail'] as const;

type Name = (typeof NAMES)[number];

const refused = (status: RefusalStatus, fields: ApiFieldFailure[]): ApiError =>
  new ApiError({ kind: 'refused', status, fields });

describe('toWriteFailure', () => {
  it.each<{
    label: string;
    error: ApiError;
    fields: WriteFieldFailure<Name>[];
    footer: string | null;
  }>([
    {
      label: 'a validation failure on a shown field',
      error: refused(400, [{ field: 'name', message: 'name-failure' }]),
      fields: [{ name: 'name', message: 'name-failure' }],
      footer: null,
    },
    {
      label: 'a conflict that names a shown field',
      error: refused(409, [{ field: 'loginEmail', message: 'taken' }]),
      fields: [{ name: 'loginEmail', message: 'taken' }],
      footer: null,
    },
    {
      label: 'a business refusal that names a shown field',
      error: refused(422, [{ field: 'name', message: 'too-long' }]),
      fields: [{ name: 'name', message: 'too-long' }],
      footer: null,
    },
    {
      label: 'an indexed failure on a list field',
      error: refused(400, [{ field: 'permissions[2]', message: 'unknown-key' }]),
      fields: [{ name: 'permissions', message: 'unknown-key' }],
      footer: null,
    },
    {
      label: 'a failure on a field the form does not show',
      error: refused(400, [
        { field: 'groupId', message: 'group-failure' },
        { field: 'name', message: 'name-failure' },
        { field: 'generalErrors', message: 'general-failure' },
      ]),
      fields: [{ name: 'name', message: 'name-failure' }],
      footer: 'group-failure',
    },
    {
      label: 'a conflict that names no field at all',
      error: refused(409, [{ field: 'request', message: 'conflict' }]),
      fields: [],
      footer: 'conflict',
    },
  ])('places $label', ({ error, fields, footer }) => {
    expect(toWriteFailure(error, NAMES)).toEqual({ fields, footer });
  });

  it.each([
    { label: 'a request that never left', error: new ApiError({ kind: 'unreachable' }) },
    { label: 'a refusal without any failure', error: refused(409, []) },
  ])('keeps $label off every field but tells it in the footer', ({ error }) => {
    const failure = toWriteFailure(error, NAMES);

    expect(failure.fields).toEqual([]);
    expect(failure.footer).not.toBeNull();
  });

  it('stays silent on an expired session the shell already handles', () => {
    expect(toWriteFailure(new ApiError({ kind: 'unauthorized' }), NAMES)).toEqual({
      fields: [],
      footer: null,
    });
  });
});
