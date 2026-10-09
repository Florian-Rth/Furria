import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { toRoleFieldErrors } from './role-form-errors';

describe('toRoleFieldErrors', () => {
  it('maps a 400 onto the form fields', () => {
    const error = new ApiError({
      kind: 'refused',
      status: 400,
      fields: [{ field: 'name', message: 'Gib der Rolle einen Namen.' }],
    });

    expect(toRoleFieldErrors(error)).toEqual([
      { field: 'name', message: 'Gib der Rolle einen Namen.' },
    ]);
  });

  it('drops a failure that belongs to no form field', () => {
    const error = new ApiError({
      kind: 'refused',
      status: 400,
      fields: [{ field: 'permissionKeys[0]', message: 'Unbekannter Berechtigungs-Key.' }],
    });

    expect(toRoleFieldErrors(error)).toEqual([]);
  });

  it('leaves a conflict to the dialog footer', () => {
    const error = new ApiError({
      kind: 'refused',
      status: 409,
      fields: [{ field: 'conflict', message: 'Eine Rolle mit diesem Namen gibt es schon.' }],
    });

    expect(toRoleFieldErrors(error)).toEqual([]);
  });

  it.each([
    ['a transport failure', new ApiError({ kind: 'status', status: 500 })],
    ['no error at all', null],
  ])('maps nothing for %s', (_case, error) => {
    expect(toRoleFieldErrors(error)).toEqual([]);
  });
});
