import { describe, expect, it } from 'vitest';
import { RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import { toFieldName, toRoleFieldErrors } from './role-form-errors';

describe('toFieldName', () => {
  it.each([
    ['Name', 'name'],
    ['Description', 'description'],
    ['PermissionKeys[0]', 'permissionKeys'],
    ['name', 'name'],
    ['', ''],
  ])('maps %j to %j', (raw, expected) => {
    expect(toFieldName(raw)).toBe(expected);
  });
});

describe('toRoleFieldErrors', () => {
  it('maps a 400 onto the form fields', () => {
    const error = new RequestFailedError(400, [
      { field: 'Name', message: 'Gib der Rolle einen Namen.' },
    ]);

    expect(toRoleFieldErrors(error)).toEqual([
      { field: 'name', message: 'Gib der Rolle einen Namen.' },
    ]);
  });

  it('drops a failure that belongs to no form field', () => {
    const error = new RequestFailedError(400, [
      { field: 'PermissionKeys[0]', message: 'Unbekannter Berechtigungs-Key.' },
    ]);

    expect(toRoleFieldErrors(error)).toEqual([]);
  });

  it('leaves a conflict to the dialog footer', () => {
    const error = new RequestFailedError(409, [
      { field: 'conflict', message: 'Eine Rolle mit diesem Namen gibt es schon.' },
    ]);

    expect(toRoleFieldErrors(error)).toEqual([]);
  });

  it.each([
    ['a transport failure', new ServerFailureError(500)],
    ['no error at all', null],
  ])('maps nothing for %s', (_case, error) => {
    expect(toRoleFieldErrors(error)).toEqual([]);
  });
});
