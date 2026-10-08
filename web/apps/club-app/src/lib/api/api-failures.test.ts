import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError } from './api-error';
import { toFormFailures } from './api-failures';

const NAMES = ['name', 'description'] as const;

describe('toFormFailures', () => {
  it('reports nothing for an error the server never shaped', () => {
    expect(toFormFailures(new RequestBlockedError(), NAMES)).toEqual({ fields: [], footer: null });
  });

  it('puts a refusal other than 400 into the footer, never on a field', () => {
    const error = new RequestFailedError(409, [{ field: 'Name', message: 'conflict' }]);

    expect(toFormFailures(error, NAMES)).toEqual({ fields: [], footer: 'conflict' });
  });

  it('maps a 400 onto the form fields of the same name', () => {
    const error = new RequestFailedError(400, [
      { field: 'Name', message: 'name-failure' },
      { field: 'description', message: 'description-failure' },
    ]);

    expect(toFormFailures(error, NAMES)).toEqual({
      fields: [
        { name: 'name', message: 'name-failure' },
        { name: 'description', message: 'description-failure' },
      ],
      footer: null,
    });
  });

  it('puts the first 400 failure the form has no field for into the footer', () => {
    const error = new RequestFailedError(400, [
      { field: 'GroupId', message: 'group-failure' },
      { field: 'Name', message: 'name-failure' },
      { field: 'generalErrors', message: 'general-failure' },
    ]);

    expect(toFormFailures(error, NAMES)).toEqual({
      fields: [{ name: 'name', message: 'name-failure' }],
      footer: 'group-failure',
    });
  });
});
