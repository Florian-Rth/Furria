import type { KkNewsStripPhoto } from '@furria/ui/KkNewsTieStrip';
import type { KkNewsCategory } from '@furria/ui/news-category';
import { NEWS_MENTION_KINDS } from '@furria/ui/news-mention-kinds';
import { readingMinutesOf } from '@furria/ui/rich-text';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CATEGORY_LABELS, CATEGORY_TONES } from '@/features/news/news-copy';
import type { NewsHub } from '@/features/news/schemas';
import type { MentionCard, MentionCards } from '@/features/rich-text/mention-cards';
import { mentionCardsOf } from '@/features/rich-text/mention-cards';
import { sessionYearsLabelOf } from '@/lib/club';
import type { ReadNews, ReadNewsAlbum, ReadNewsArticle, ReadNewsPost } from './schemas';

export interface ReadNewsSessionView {
  key: string;
  title: string;
  posts: ReadNewsPost[];
}

export interface ReadNewsFront {
  lead: ReadNewsPost;
  sessions: ReadNewsSessionView[];
}

const LONG_DATE = 'd. MMMM yyyy';
const SHORT_DATE = 'dd.MM.';

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
  const minutes = readingMinutesOf(text, NEWS_MENTION_KINDS);

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

export const articleMentionCardsOf = (article: ReadNewsArticle): MentionCards =>
  mentionCardsOf([
    ...article.mentionedGroups.map((group): MentionCard => ({ kind: 'group', group })),
    ...article.mentionedPersons.map((person): MentionCard => ({ kind: 'person', person })),
  ]);

export const editablePostIdOf = (hub: NewsHub | undefined, slug: string): string | null => {
  const post = hub?.sections
    .flatMap((section) => section.posts)
    .find((candidate) => candidate.slug === slug);

  return post === undefined ? null : String(post.newsPostId);
};
