import type { KkNewsStripPhoto } from '@furria/ui/KkNewsTieStrip';
import type { KkNewsCategory } from '@furria/ui/news-category';
import type { NewsMention } from '@furria/ui/news-text';
import { newsReadingMinutesOf } from '@furria/ui/news-text';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CATEGORY_LABELS, CATEGORY_TONES } from '@/features/news/news-copy';
import type { NewsHub } from '@/features/news/schemas';
import { sessionYearsLabelOf } from '@/lib/club';
import type {
  ReadNews,
  ReadNewsAlbum,
  ReadNewsArticle,
  ReadNewsGroup,
  ReadNewsPerson,
  ReadNewsPost,
} from './schemas';

export interface ReadNewsSessionView {
  key: string;
  title: string;
  posts: ReadNewsPost[];
}

export interface ReadNewsFront {
  lead: ReadNewsPost;
  sessions: ReadNewsSessionView[];
}

export interface ReadNewsMentionCards {
  groups: ReadonlyMap<number, ReadNewsGroup>;
  persons: ReadonlyMap<number, ReadNewsPerson>;
}

export type ReadNewsMentionCard =
  | { kind: 'group'; group: ReadNewsGroup }
  | { kind: 'person'; person: ReadNewsPerson };

const LONG_DATE = 'd. MMMM yyyy';
const SHORT_DATE = 'dd.MM.';
const NAME_WORDS = /[\p{L}\p{N}]+/gu;
const INITIALS_LENGTH = 2;

export const sessionTitleOf = (startYear: number, sessionNumber: number | null): string =>
  sessionNumber === null
    ? `Session ${sessionYearsLabelOf(startYear)}`
    : `${sessionNumber}. Session ${sessionYearsLabelOf(startYear)}`;

export const readNewsFrontOf = (news: ReadNews): ReadNewsFront | null => {
  const [newest, ...older] = news.sessions;
  const [lead, ...following] = newest?.posts ?? [];

  if (newest === undefined || lead === undefined) {
    return null;
  }

  const sessions = [{ ...newest, posts: following }, ...older]
    .filter((session) => session.posts.length > 0)
    .map((session) => ({
      key: String(session.sessionStartYear),
      title: sessionTitleOf(session.sessionStartYear, session.sessionNumber),
      posts: session.posts,
    }));

  return { lead, sessions };
};

export const newestPostsOf = (news: ReadNews, limit: number): ReadNewsPost[] =>
  news.sessions.flatMap((session) => session.posts).slice(0, limit);

export const readNewsCategoryOf = (category: ReadNewsPost['category']): KkNewsCategory => ({
  label: CATEGORY_LABELS[category],
  tone: CATEGORY_TONES[category],
});

export const longDateOf = (iso: string): string => format(new Date(iso), LONG_DATE, { locale: de });

export const shortDateOf = (iso: string): string => format(new Date(iso), SHORT_DATE);

export const readingTimeOf = (text: string): string | null => {
  const minutes = newsReadingMinutesOf(text);

  return minutes === null ? null : `${minutes} Min. Lesezeit`;
};

export const bylineOf = (article: ReadNewsArticle): string => {
  const facts = [
    longDateOf(article.publishedAt),
    article.author === null ? null : `von ${article.author.firstName} ${article.author.lastName}`,
    readingTimeOf(article.text),
  ];

  return facts.filter((fact) => fact !== null).join(' · ');
};

export const photoCountOf = (count: number): string => (count === 1 ? '1 Foto' : `${count} Fotos`);

export const albumStripOf = (album: ReadNewsAlbum): KkNewsStripPhoto[] =>
  album.photos.map((photo) => ({
    id: photo.mediaItemId,
    picture: photo,
    aspect: photo.width / photo.height,
  }));

export const mentionCardsOf = (article: ReadNewsArticle): ReadNewsMentionCards => ({
  groups: new Map(article.mentionedGroups.map((group) => [group.groupId, group])),
  persons: new Map(article.mentionedPersons.map((person) => [person.personId, person])),
});

export const mentionCardOf = (
  mention: NewsMention,
  cards: ReadNewsMentionCards,
): ReadNewsMentionCard | null => {
  if (mention.kind === 'group') {
    const group = cards.groups.get(mention.id);
    return group === undefined ? null : { kind: 'group', group };
  }

  const person = cards.persons.get(mention.id);
  return person === undefined ? null : { kind: 'person', person };
};

export const groupInitialsOf = (name: string): string =>
  (name.match(NAME_WORDS) ?? [])
    .slice(0, INITIALS_LENGTH)
    .map((word) => word.charAt(0).toLocaleUpperCase('de-DE'))
    .join('');

export const editablePostIdOf = (hub: NewsHub | undefined, slug: string): string | null => {
  const post = hub?.sections
    .flatMap((section) => section.posts)
    .find((candidate) => candidate.slug === slug);

  return post === undefined ? null : String(post.newsPostId);
};
