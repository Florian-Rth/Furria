import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { studioFailureOf } from './studio-failure';

const refused = (status: 400 | 409 | 422): ApiError =>
  new ApiError({ kind: 'refused', status, fields: [] });

const reloadsOf = (error: Error): number => {
  let reloads = 0;
  const notice = studioFailureOf(error, () => {
    reloads += 1;
  });
  if (typeof notice === 'object' && notice !== null) {
    for (const action of notice.actions ?? []) {
      action.onSelect();
    }
  }

  return reloads;
};

describe('studioFailureOf', () => {
  it.each<[string, Error, number]>([
    ['a conflict offers a reload', refused(409), 1],
    ['a refused document offers nothing', refused(422), 0],
    ['a lost connection offers nothing', new Error('offline'), 0],
  ])('%s', (_, error, expected) => {
    expect(reloadsOf(error)).toBe(expected);
  });
});
