import { describe, expect, it } from 'vitest';
import { toFieldFailures } from './api-failures';

describe('toFieldFailures', () => {
  it('flattens every message of every field into its own failure', () => {
    expect(
      toFieldFailures({
        errors: { email: ['erste', 'zweite'], request: ['dritte'] },
      }),
    ).toEqual([
      { field: 'email', message: 'erste' },
      { field: 'email', message: 'zweite' },
      { field: 'request', message: 'dritte' },
    ]);
  });

  it.each([
    ['FirstName', 'firstName'],
    ['', ''],
  ])('names the field %j as the form does: %j', (field, expected) => {
    expect(toFieldFailures({ errors: { [field]: ['x'] } })[0]?.field).toBe(expected);
  });
});
