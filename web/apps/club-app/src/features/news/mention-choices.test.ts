import { describe, expect, it } from 'vitest';
import { mentionChoicesOf, steppedIndexOf } from './mention-choices';
import type { NewsMentionable } from './types';

const mentionable = (fields: Partial<NewsMentionable>): NewsMentionable => ({
  kind: 'group',
  id: 'group:1',
  targetId: 1,
  name: 'Elferrat',
  line: 'Der Rat der Elf',
  tone: 'clay',
  initials: 'ER',
  pictureSource: null,
  isPublic: true,
  ...fields,
});

describe('mentionChoicesOf', () => {
  const all = [
    mentionable({ kind: 'person', id: 'person-anna', name: 'Anna Becker', line: 'Präsidentin' }),
    mentionable({ id: 'group-elferrat' }),
    mentionable({ id: 'group-kinder', name: 'Kindergarde', isPublic: false }),
    mentionable({ id: 'group-funken', name: 'Rote Funken', line: 'Tanzgarde' }),
  ];

  it.each([
    [
      'offers only public targets, groups first',
      '',
      ['group-elferrat', 'group-funken', 'person-anna'],
    ],
    ['matches the start of any word in name or line', 'tanz', ['group-funken']],
    ['matches an office', 'präs', ['person-anna']],
    ['never offers a hidden group', 'kinder', []],
  ])('%s', (_, query, expected) => {
    expect(mentionChoicesOf(all, query).map((choice) => choice.id)).toEqual(expected);
  });
});

describe('steppedIndexOf', () => {
  it.each([
    ['next', 0, 3, 'next', 1],
    ['next wraps', 2, 3, 'next', 0],
    ['previous wraps', 0, 3, 'previous', 2],
    ['choose keeps', 1, 3, 'choose', 1],
    ['an empty list', 4, 0, 'next', 0],
  ] as const)('%s', (_, index, count, key, expected) => {
    expect(steppedIndexOf(index, count, key)).toBe(expected);
  });
});
