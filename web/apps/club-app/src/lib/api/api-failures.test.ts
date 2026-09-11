import { describe, expect, it } from 'vitest';
import { isRequestFailedStatus, toFieldFailures } from './api-failures';

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
