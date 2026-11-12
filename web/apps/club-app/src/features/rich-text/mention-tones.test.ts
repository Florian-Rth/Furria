import { describe, expect, it } from 'vitest';
import { mentionTonesOf } from './mention-tones';
import type { Mentionable } from './types';

const mentionableOf = (id: string, kind: Mentionable['kind']): Mentionable => ({
  kind,
  id,
  targetId: Number(id.split(':')[1]),
  name: id,
  line: '',
  tone: null,
  initials: '',
  image: null,
  isOffered: true,
});

describe('mentionTonesOf', () => {
  it.each<[string, readonly Mentionable['kind'][], [string, boolean][]]>([
    [
      'Mit @[Funken](group:12) und @[Alt](person:9).',
      ['group', 'person'],
      [
        ['group:12', true],
        ['person:9', false],
      ],
    ],
    [
      'Zum @[Termin](calendar-entry:4)',
      ['group', 'person', 'calendar-entry'],
      [
        ['group:12', true],
        ['calendar-entry:4', false],
      ],
    ],
    ['Zum @[Termin](calendar-entry:4)', ['group', 'person'], [['group:12', true]]],
  ])('marks the stale mentions of %j among kinds %j', (text, kinds, expected) => {
    const tones = mentionTonesOf([mentionableOf('group:12', 'group')], text, kinds);

    expect(tones.map((tone) => [tone.id, tone.isPublic])).toEqual(expected);
  });
});
