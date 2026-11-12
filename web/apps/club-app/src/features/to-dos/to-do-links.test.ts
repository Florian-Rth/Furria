import { describe, expect, it } from 'vitest';
import { toToDoLink } from './to-do-links';

describe('toToDoLink', () => {
  it('leads a group to-do to that group’s Jeck-Check page', () => {
    expect(toToDoLink({ kind: 'groupMatcherStatementsOpen', group: { groupId: 7 } })).toEqual({
      to: '/groups/$groupId/group-matcher',
      params: { groupId: '7' },
      search: {},
    });
  });

  it('falls back to the groups list when the group is missing', () => {
    expect(toToDoLink({ kind: 'groupMatcherStatementsOpen', group: null }).to).toBe('/groups');
  });
});
