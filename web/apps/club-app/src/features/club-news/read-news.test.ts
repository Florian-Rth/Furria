import { describe, expect, it } from 'vitest';
import { editablePostIdOf, newestPostsOf, readNewsFrontOf, sessionTitleOf } from './read-news';

const postOf = (
  slug: string,
): {
  slug: string;
  title: string;
  teaser: string;
  text: string;
  category: 'club';
  publishedAt: string;
  picture: null;
} => ({
  slug,
  title: slug,
  teaser: 'Vorspann',
  text: 'Text',
  category: 'club',
  publishedAt: '2026-11-01T10:00:00+01:00',
  picture: null,
});

describe('readNewsFrontOf', () => {
  it('leads with the newest post and keeps the rest of its session before the older ones', () => {
    const front = readNewsFrontOf({
      sessions: [
        { sessionStartYear: 2026, sessionNumber: 71, posts: [postOf('neu'), postOf('mitte')] },
        { sessionStartYear: 2025, sessionNumber: null, posts: [postOf('alt')] },
      ],
    });

    expect(front?.lead.slug).toBe('neu');
    expect(
      front?.sessions.map((session) => [session.key, session.posts.map((p) => p.slug)]),
    ).toEqual([
      ['2026', ['mitte']],
      ['2025', ['alt']],
    ]);
  });

  it('drops the current session when its only post leads', () => {
    const front = readNewsFrontOf({
      sessions: [
        { sessionStartYear: 2026, sessionNumber: 71, posts: [postOf('neu')] },
        { sessionStartYear: 2025, sessionNumber: 70, posts: [postOf('alt')] },
      ],
    });

    expect(front?.sessions.map((session) => session.key)).toEqual(['2025']);
  });

  it.each([
    { sessions: [] },
    { sessions: [{ sessionStartYear: 2026, sessionNumber: 71, posts: [] }] },
  ])('has no front without a published post: %#', (news) => {
    expect(readNewsFrontOf(news)).toBeNull();
  });
});

describe('sessionTitleOf', () => {
  it.each([
    [2026, 71, '71. Session 2026/27'],
    [2099, null, 'Session 2099/00'],
  ])('names session %s numbered %s', (startYear, sessionNumber, title) => {
    expect(sessionTitleOf(startYear, sessionNumber)).toBe(title);
  });
});

describe('newestPostsOf', () => {
  it('takes the newest posts across sessions up to the limit', () => {
    const posts = newestPostsOf(
      {
        sessions: [
          { sessionStartYear: 2026, sessionNumber: 71, posts: [postOf('a')] },
          { sessionStartYear: 2025, sessionNumber: 70, posts: [postOf('b'), postOf('c')] },
        ],
      },
      2,
    );

    expect(posts.map((post) => post.slug)).toEqual(['a', 'b']);
  });
});

describe('editablePostIdOf', () => {
  const summaryOf = (newsPostId: number, slug: string | null) => ({
    newsPostId,
    title: 'Titel',
    teaser: '',
    category: null,
    state: 'published' as const,
    hasPendingChanges: false,
    slug,
    publishedAt: null,
    withdrawnAt: null,
    pendingSavedAt: null,
    picture: null,
    missing: [],
    updatedAt: '2026-11-01T10:00:00+01:00',
    author: null,
  });
  const hub = {
    sections: [
      { sessionStartYear: null, sessionNumber: null, posts: [summaryOf(1, null)] },
      { sessionStartYear: 2026, sessionNumber: 71, posts: [summaryOf(7, 'motto')] },
    ],
  };

  it.each([
    [hub, 'motto', '7'],
    [hub, 'fremd', null],
    [undefined, 'motto', null],
  ])('finds the post to edit %#', (source, slug, postId) => {
    expect(editablePostIdOf(source, slug)).toBe(postId);
  });
});
