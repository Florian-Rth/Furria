import type { MentionTarget } from '@furria/ui/rich-text';
import { describe, expect, it } from 'vitest';
import { mentionCardOf, mentionCardsOf } from './mention-cards';

describe('mentionCardOf', () => {
  const cards = mentionCardsOf([
    {
      kind: 'group',
      group: { groupId: 3, name: 'Garde', description: '', tone: null, picture: null },
    },
    {
      kind: 'person',
      person: {
        personId: 5,
        firstName: 'Eva',
        lastName: 'Huber',
        officeName: 'Präsidentin',
        portrait: null,
      },
    },
  ]);

  it.each<[MentionTarget, string | null]>([
    [{ kind: 'group', id: 3 }, 'group'],
    [{ kind: 'person', id: 5 }, 'person'],
    [{ kind: 'group', id: 5 }, null],
    [{ kind: 'person', id: 3 }, null],
    [{ kind: 'event', id: 3 }, null],
    [{ kind: 'album', id: 5 }, null],
  ])('finds the card of mention %j', (target, kind) => {
    expect(mentionCardOf(target, cards)?.kind ?? null).toBe(kind);
  });
});
