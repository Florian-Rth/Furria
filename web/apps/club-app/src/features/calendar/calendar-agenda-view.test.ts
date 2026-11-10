import { describe, expect, it } from 'vitest';
import { toAudienceLabel } from './calendar-agenda-view';

describe('toAudienceLabel', () => {
  it('names every audience group', () => {
    expect(
      toAudienceLabel({
        audience: 'groups',
        audienceGroups: [
          { groupId: 1, name: 'Tanzgarde', tone: null },
          { groupId: 2, name: 'Kindergarde', tone: null },
        ],
        audiencePeople: [],
      }),
    ).toBe('Tanzgarde, Kindergarde');
  });

  it('names every chosen person by full name', () => {
    expect(
      toAudienceLabel({
        audience: 'people',
        audienceGroups: [],
        audiencePeople: [
          { personId: 1, firstName: 'Bea', lastName: 'Garde' },
          { personId: 2, firstName: 'Kalle', lastName: 'Klein' },
        ],
      }),
    ).toBe('Bea Garde, Kalle Klein');
  });
});
