import { describe, expect, it } from 'vitest';
import { toBoardTermPeriod } from './board-terms';

const TODAY = '2026-11-09';

describe('toBoardTermPeriod', () => {
  it.each([
    {
      label: 'an open seat',
      term: { since: '2022-03-01', until: null },
      expected: { kind: 'current', since: '2022-03-01' },
    },
    {
      label: 'a seat ending later',
      term: { since: '2022-03-01', until: '2027-02-28' },
      expected: { kind: 'current', since: '2022-03-01' },
    },
    {
      label: 'a seat ending today',
      term: { since: '2022-03-01', until: TODAY },
      expected: { kind: 'current', since: '2022-03-01' },
    },
    {
      label: 'a seat that ended yesterday',
      term: { since: '2018-03-01', until: '2026-11-08' },
      expected: { kind: 'past', since: '2018-03-01', until: '2026-11-08' },
    },
  ])('reads $label', ({ term, expected }) => {
    expect(toBoardTermPeriod(term, TODAY)).toEqual(expected);
  });
});
