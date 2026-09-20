import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError } from './api-error';
import { isRequestFailedStatus, toFieldFailures, toFormFailures } from './api-failures';

describe('isRequestFailedStatus', () => {
  it.each([
    [400, true],
    [409, true],
    [422, true],
    [401, false],
    [403, false],
    [404, false],
    [500, false],
  ])('reads %d as a refusal the member can be told about: %s', (status, expected) => {
    expect(isRequestFailedStatus(status)).toBe(expected);
  });
});

describe('toFieldFailures', () => {
  it('keeps every message of every field, in payload order', () => {
    expect(
      toFieldFailures({
        errors: {
          endedOn: ['Das Ende liegt vor dem Beginn.', 'Der Zeitraum überschneidet sich.'],
          generalErrors: ['Die Person ist schon in dieser Gruppe.'],
        },
      }),
    ).toEqual([
      { field: 'endedOn', message: 'Das Ende liegt vor dem Beginn.' },
      { field: 'endedOn', message: 'Der Zeitraum überschneidet sich.' },
      { field: 'generalErrors', message: 'Die Person ist schon in dieser Gruppe.' },
    ]);
  });

  it('has nothing to say about an empty error map', () => {
    expect(toFieldFailures({ errors: {} })).toEqual([]);
  });
});

const NAMES = ['name', 'description'] as const;

describe('toFormFailures', () => {
  it('reports nothing for an error the server never shaped', () => {
    expect(toFormFailures(new RequestBlockedError(), NAMES)).toEqual({ fields: [], footer: null });
  });

  it('puts a 409 into the footer, never on a field', () => {
    const error = new RequestFailedError(409, [
      { field: 'generalErrors', message: 'Eine Gruppe mit diesem Namen gibt es schon.' },
    ]);

    expect(toFormFailures(error, NAMES)).toEqual({
      fields: [],
      footer: 'Eine Gruppe mit diesem Namen gibt es schon.',
    });
  });

  it('puts a 422 into the footer', () => {
    const error = new RequestFailedError(422, [{ field: 'request', message: 'Zu spät.' }]);

    expect(toFormFailures(error, NAMES).footer).toBe('Zu spät.');
  });

  it('maps a 400 onto the form field of the same name', () => {
    const error = new RequestFailedError(400, [{ field: 'Name', message: 'Zu lang.' }]);

    expect(toFormFailures(error, NAMES)).toEqual({
      fields: [{ name: 'name', message: 'Zu lang.' }],
      footer: null,
    });
  });

  it('falls back to the footer for a 400 field the form does not have', () => {
    const error = new RequestFailedError(400, [{ field: 'groupId', message: 'Ungültig.' }]);

    expect(toFormFailures(error, NAMES)).toEqual({ fields: [], footer: 'Ungültig.' });
  });

  it('splits a mixed 400 between the fields and the footer', () => {
    const error = new RequestFailedError(400, [
      { field: 'Name', message: 'Zu lang.' },
      { field: 'Description', message: 'Zu lang.' },
      { field: 'GroupId', message: 'Ungültig.' },
    ]);
    const failures = toFormFailures(error, NAMES);

    expect(failures.fields.map((failure) => failure.name)).toEqual(['name', 'description']);
    expect(failures.footer).toBe('Ungültig.');
  });
});
