import { describe, expect, it } from 'vitest';
import { toContactChangeLine } from './contact-change';

const TODAY = new Date(2026, 9, 20, 12, 0);

describe('toContactChangeLine', () => {
  it.each([
    {
      case: 'names the other person by first name',
      changedBy: { personId: 4, firstName: 'Anna', lastName: 'Kessler' },
      viewerPersonId: 7,
      at: '2026-10-03T10:00:00+00:00',
      expected: 'geändert von Anna am 3. Okt.',
    },
    {
      case: 'says "dir" when the viewer changed them herself',
      changedBy: { personId: 7, firstName: 'Paula', lastName: 'Brendel' },
      viewerPersonId: 7,
      at: '2026-10-03T10:00:00+00:00',
      expected: 'geändert von dir am 3. Okt.',
    },
    {
      case: 'names the changer when the viewer is not known',
      changedBy: { personId: 7, firstName: 'Paula', lastName: 'Brendel' },
      viewerPersonId: null,
      at: '2026-03-14T10:00:00+00:00',
      expected: 'geändert von Paula am 14. März',
    },
    {
      case: 'adds the year when the change lies in an earlier year',
      changedBy: { personId: 4, firstName: 'Anna', lastName: 'Kessler' },
      viewerPersonId: 7,
      at: '2025-11-30T10:00:00+00:00',
      expected: 'geändert von Anna am 30. Nov. 2025',
    },
  ])('$case', ({ changedBy, viewerPersonId, at, expected }) => {
    expect(toContactChangeLine({ at, changedBy }, viewerPersonId, TODAY)).toBe(expected);
  });
});
