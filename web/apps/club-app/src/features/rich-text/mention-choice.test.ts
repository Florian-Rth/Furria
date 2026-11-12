import { describe, expect, it } from 'vitest';
import { mentionChoiceOf } from './mention-choice';
import type { Mentionable } from './types';

const mentionableOf = (kind: Mentionable['kind']): Mentionable => ({
  kind,
  id: `${kind}:1`,
  targetId: 1,
  name: 'Name',
  line: 'Zeile',
  tone: null,
  initials: 'NA',
  image: null,
  isOffered: true,
});

describe('mentionChoiceOf', () => {
  it.each<[Mentionable['kind'], 'group' | 'person']>([
    ['group', 'group'],
    ['person', 'person'],
  ])('shows a %s with a %s face', (kind, face) => {
    expect(mentionChoiceOf(mentionableOf(kind)).kind).toBe(face);
  });
});
