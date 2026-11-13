import { describe, expect, it } from 'vitest';
import { mentionablesOf } from './mentionables';

const RESPONSE = {
  groups: [
    { groupId: 12, name: 'Rote Funken', description: '', tone: 'rose' as const, picture: null },
  ],
  persons: [
    {
      personId: 3,
      firstName: 'Anna',
      lastName: 'Becker',
      officeName: 'Präsidentin',
      portrait: null,
    },
  ],
};

describe('mentionablesOf', () => {
  it('keys groups and board persons the way the text stores them', () => {
    expect(mentionablesOf(RESPONSE, 'Gruppe').map((entry) => [entry.id, entry.initials])).toEqual([
      ['group:12', 'RF'],
      ['person:3', 'AB'],
    ]);
  });
});
