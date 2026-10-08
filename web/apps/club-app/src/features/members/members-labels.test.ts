import { describe, expect, it } from 'vitest';
import type { MembersEmptyCause } from './members-labels';
import { membersEmptyCauseOf, toLetterAnchorId } from './members-labels';

describe('toLetterAnchorId', () => {
  it.each([
    ['A', 'letter-a'],
    ['#', 'letter-other'],
  ])('anchors %s at %s', (letter, expected) => {
    expect(toLetterAnchorId(letter)).toBe(expected);
  });
});

describe('membersEmptyCauseOf', () => {
  it.each<[string, string, string, MembersEmptyCause['kind']]>([
    ['a running query, whatever the filter', '  Schmidtke ', 'ended', 'query'],
    ['a blank query under Alle', '   ', 'all', 'empty'],
    ['a state filter hiding everyone', '', 'ended', 'filtered'],
  ])('blames %s', (_case, query, state, expected) => {
    expect(membersEmptyCauseOf(query, state).kind).toBe(expected);
  });

  it('trims the query it names', () => {
    expect(membersEmptyCauseOf('  Schmidtke ', 'active')).toEqual({
      kind: 'query',
      needle: 'Schmidtke',
    });
  });
});
