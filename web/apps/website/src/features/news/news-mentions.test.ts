import type { NewsMention } from '@furria/ui/news-text';
import { describe, expect, it } from 'vitest';
import type { NewsArticle } from '@/lib/public-news/schemas';
import { collectMentionCards, groupInitialsOf, mentionCardOf } from './news-mentions';

const article: NewsArticle = {
  slug: 'umzug',
  title: 'Umzug',
  teaser: 'Teaser',
  text: 'Text',
  category: 'groups',
  publishedAt: '2026-02-16T14:11',
  picture: null,
  author: null,
  pictureCaption: null,
  mentionedGroups: [{ groupId: 3, name: 'Elferrat', description: '', tone: null, picture: null }],
  mentionedPersons: [
    { personId: 3, firstName: 'Anna', lastName: 'Berg', officeName: 'Präsidentin', portrait: null },
  ],
  event: null,
  album: null,
};

describe('mentionCardOf', () => {
  const cards = collectMentionCards(article);

  it.each<[NewsMention, string | null]>([
    [{ kind: 'group', id: 3, label: 'Elferrat' }, 'group'],
    [{ kind: 'person', id: 3, label: 'Anna' }, 'person'],
    [{ kind: 'group', id: 9, label: 'Archiviert' }, null],
    [{ kind: 'person', id: 9, label: 'Gelöscht' }, null],
  ])('finds the card of %o as %s', (mention, kind) => {
    expect(mentionCardOf(mention, cards)?.kind ?? null).toBe(kind);
  });
});

describe('groupInitialsOf', () => {
  it.each([
    ['Elferrat', 'E'],
    ['Garde der Furrschen', 'GD'],
    ['  11er-Rat ', '1R'],
  ])('shortens %s to %s', (name, initials) => {
    expect(groupInitialsOf(name)).toBe(initials);
  });
});
