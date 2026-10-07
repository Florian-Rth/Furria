import { describe, expect, it } from 'vitest';
import { toActLine } from './act-line';

const TODAY = new Date(2026, 9, 20, 12, 0);

describe('toActLine', () => {
  it.each([
    {
      case: 'names the other person by first name',
      actor: { personId: 4, firstName: 'Anna', lastName: 'Kessler' },
      viewerPersonId: 7,
      actedOn: new Date('2026-10-03T10:00:00+00:00'),
      expected: 'geändert von Anna am 3. Okt.',
    },
    {
      case: 'says "dir" when the viewer acted herself',
      actor: { personId: 7, firstName: 'Paula', lastName: 'Brendel' },
      viewerPersonId: 7,
      actedOn: new Date('2026-10-03T10:00:00+00:00'),
      expected: 'geändert von dir am 3. Okt.',
    },
    {
      case: 'names the actor when the viewer is not known',
      actor: { personId: 7, firstName: 'Paula', lastName: 'Brendel' },
      viewerPersonId: null,
      actedOn: new Date('2026-03-14T10:00:00+00:00'),
      expected: 'geändert von Paula am 14. März',
    },
    {
      case: 'names nobody when the actor is gone or was the managing login',
      actor: null,
      viewerPersonId: 7,
      actedOn: new Date('2026-10-03T10:00:00+00:00'),
      expected: 'geändert am 3. Okt.',
    },
    {
      case: 'adds the year when the act lies in an earlier year',
      actor: { personId: 4, firstName: 'Anna', lastName: 'Kessler' },
      viewerPersonId: 7,
      actedOn: new Date('2025-11-30T10:00:00+00:00'),
      expected: 'geändert von Anna am 30. Nov. 2025',
    },
  ])('$case', ({ actor, viewerPersonId, actedOn, expected }) => {
    expect(toActLine('geändert', actor, viewerPersonId, actedOn, TODAY)).toBe(expected);
  });
});
