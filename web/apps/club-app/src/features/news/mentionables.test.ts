import { describe, expect, it } from 'vitest';
import { mentionablesOf, mentionTonesOf } from './mentionables';

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

describe('mentionTonesOf', () => {
  it('marks a mention whose target is no longer mentionable as not public', () => {
    const mentionables = mentionablesOf(RESPONSE, 'Gruppe');
    const text = 'Mit @[Funken](group:12) und @[Alt](person:9).';

    expect(mentionTonesOf(mentionables, text).map((tone) => [tone.id, tone.isPublic])).toEqual([
      ['group:12', true],
      ['person:3', true],
      ['person:9', false],
    ]);
  });
});
