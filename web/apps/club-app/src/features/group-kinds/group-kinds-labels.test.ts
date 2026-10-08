import { describe, expect, it } from 'vitest';
import { toGroupKindOptions } from './group-kinds-labels';

const KINDS = [
  { groupKindId: 3, name: 'Zugabteilung' },
  { groupKindId: 1, name: 'Ältestenrat' },
  { groupKindId: 2, name: 'Garde' },
];

describe('toGroupKindOptions', () => {
  it.each([
    ['nothing held', null, ['', '3', '1', '2']],
    ['a held group kind that still runs', { groupKindId: 2, name: 'Garde' }, ['', '3', '1', '2']],
    [
      'a held group kind that left the running list',
      { groupKindId: 9, name: 'Spielmannszug' },
      ['', '3', '1', '2', '9'],
    ],
  ])('leads with the empty choice and keeps the set order for %s', (_case, held, expected) => {
    expect(toGroupKindOptions(KINDS, held).map((option) => option.value)).toEqual(expected);
  });
});
