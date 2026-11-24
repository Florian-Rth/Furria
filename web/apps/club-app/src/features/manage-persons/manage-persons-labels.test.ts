import { describe, expect, it } from 'vitest';
import { membershipPeriodOf } from './manage-persons-labels';

describe('membershipPeriodOf', () => {
  it.each([
    {
      scenario: 'a closed period',
      startedOn: '2009-01-11',
      endedOn: '2016-02-10',
      expected: { kind: 'closed', endedOn: '2016-02-10' },
    },
    {
      scenario: 'a future start',
      startedOn: '2026-10-27',
      endedOn: null,
      expected: { kind: 'upcoming' },
    },
    {
      scenario: 'a start today',
      startedOn: '2026-09-12',
      endedOn: null,
      expected: { kind: 'running' },
    },
  ])('reads $scenario', ({ startedOn, endedOn, expected }) => {
    expect(membershipPeriodOf(startedOn, endedOn, '2026-09-12')).toEqual(expected);
  });
});
