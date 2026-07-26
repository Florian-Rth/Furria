import { kkTokens } from '@furria/ui';
import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { currentSession } from '@/lib/club';
import type { NewsPost } from './news-content';
import {
  buildArchiveLabel,
  buildNewsEyebrow,
  buildNewsListFooterNote,
  deriveReadingTime,
  findPostBySlug,
  NEWS_POSTS,
  newsEyebrow,
  resolveArchiveSession,
  resolveCategoryContrastText,
  resolveCategoryTint,
  selectFollowingPosts,
  selectLeadPost,
  sortPostsByDateDesc,
} from './news-content';

const post = (slug: string, publishedAt: string): NewsPost => ({
  slug,
  title: slug,
  category: 'Verein',
  publishedAt,
  teaser: 'Teaser',
  body: ['Absatz'],
  image: null,
  author: null,
});

describe('NEWS_POSTS', () => {
  it('gives every Meldung a unique slug', () => {
    const slugs = NEWS_POSTS.map((newsPost) => newsPost.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('keeps two Meldungen photo-less so the Plakat fallback stays exercised', () => {
    expect(NEWS_POSTS.filter((newsPost) => newsPost.image === null)).toHaveLength(2);
  });

  it('omits the author instead of inventing an institutional one', () => {
    expect(NEWS_POSTS.filter((newsPost) => newsPost.author !== null)).toHaveLength(1);
    expect(NEWS_POSTS.map((newsPost) => newsPost.author)).not.toContain('Vorstand');
  });

  it('gives every Meldung the fields the list and the article need', () => {
    for (const newsPost of NEWS_POSTS) {
      expect(newsPost.title).not.toBe('');
      expect(newsPost.teaser).not.toBe('');
      expect(newsPost.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(newsPost.body.length).toBeGreaterThan(0);
    }
  });
});

describe('sortPostsByDateDesc', () => {
  it('puts the newest Meldung first', () => {
    const sorted = sortPostsByDateDesc([
      post('older', '2026-05-30'),
      post('newest', '2026-07-18'),
      post('middle', '2026-06-14'),
    ]);

    expect(sorted.map((newsPost) => newsPost.slug)).toEqual(['newest', 'middle', 'older']);
  });

  it('leaves the source array untouched', () => {
    const posts = [post('older', '2026-05-30'), post('newest', '2026-07-18')];
    sortPostsByDateDesc(posts);

    expect(posts.map((newsPost) => newsPost.slug)).toEqual(['older', 'newest']);
  });

  it('leads the seeded Meldungen with the Motto-Verkündung', () => {
    expect(sortPostsByDateDesc(NEWS_POSTS)[0]?.slug).toBe('motto-56');
  });
});

describe('selectLeadPost', () => {
  it('derives the Aufmacher from the date instead of a flag', () => {
    const lead = selectLeadPost([
      post('older', '2026-05-30'),
      post('newest', '2026-07-18'),
      post('middle', '2026-06-14'),
    ]);

    expect(lead?.slug).toBe('newest');
  });

  it('has no Aufmacher without Meldungen', () => {
    expect(selectLeadPost([])).toBeUndefined();
  });
});

describe('selectFollowingPosts', () => {
  it('leaves the Aufmacher out of the rows below', () => {
    const following = selectFollowingPosts([
      post('older', '2026-05-30'),
      post('newest', '2026-07-18'),
      post('middle', '2026-06-14'),
    ]);

    expect(following.map((newsPost) => newsPost.slug)).toEqual(['middle', 'older']);
  });

  it('shows every seeded Meldung exactly once across Aufmacher and rows', () => {
    const lead = selectLeadPost(NEWS_POSTS);
    const following = selectFollowingPosts(NEWS_POSTS);
    const shown = [...(lead === undefined ? [] : [lead]), ...following].map(
      (newsPost) => newsPost.slug,
    );

    expect(new Set(shown).size).toBe(NEWS_POSTS.length);
    expect(following).not.toContain(lead);
  });

  it('has no rows for a single Meldung', () => {
    expect(selectFollowingPosts([post('only', '2026-07-18')])).toEqual([]);
  });
});

describe('findPostBySlug', () => {
  it('finds a seeded Meldung', () => {
    expect(findPostBySlug(NEWS_POSTS, 'jhv')?.title).toContain('Jahreshauptversammlung');
  });

  it('returns undefined for an unknown slug so the route can throw not-found', () => {
    expect(findPostBySlug(NEWS_POSTS, 'gibt-es-nicht')).toBeUndefined();
  });
});

describe('resolveCategoryTint', () => {
  const theme = createTheme();

  it('gives the flagship Session category red', () => {
    expect(resolveCategoryTint(theme, 'Session')).toBe(theme.palette.primary.main);
  });

  it('gives Erfolge gold', () => {
    expect(resolveCategoryTint(theme, 'Erfolge')).toBe(theme.palette.warning.main);
  });

  it('gives both institutional categories ink', () => {
    expect(resolveCategoryTint(theme, 'Verein')).toBe(theme.palette.text.primary);
    expect(resolveCategoryTint(theme, 'Gruppen')).toBe(theme.palette.text.primary);
  });
});

describe('resolveCategoryContrastText', () => {
  const theme = createTheme();

  it('reads the contrast text off the tinted palette entry', () => {
    expect(resolveCategoryContrastText(theme, 'Session')).toBe(theme.palette.primary.contrastText);
    expect(resolveCategoryContrastText(theme, 'Erfolge')).toBe(theme.palette.warning.contrastText);
  });

  it('flips the ink tint against the page background', () => {
    expect(resolveCategoryContrastText(theme, 'Verein')).toBe(theme.palette.background.default);
  });

  it('keeps dark text on the brand gold in both colour schemes', () => {
    for (const gold of [kkTokens.color.light.gold, kkTokens.color.dark.gold]) {
      const goldTheme = createTheme({ palette: { warning: { main: gold } } });
      expect(resolveCategoryContrastText(goldTheme, 'Erfolge')).toContain('0, 0, 0');
    }
  });
});

describe('deriveReadingTime', () => {
  it('never drops below one minute', () => {
    expect(deriveReadingTime(['Kurz.'])).toBe('1 Min. Lesezeit');
  });

  it('rounds a long Meldung up to whole minutes', () => {
    expect(deriveReadingTime([Array.from({ length: 200 }, () => 'Wort').join(' ')])).toBe(
      '2 Min. Lesezeit',
    );
  });

  it('counts across all paragraphs of the body', () => {
    const paragraph = Array.from({ length: 100 }, () => 'Wort').join(' ');
    expect(deriveReadingTime([paragraph, paragraph, paragraph])).toBe('2 Min. Lesezeit');
  });
});

describe('resolveArchiveSession', () => {
  const duringSeededSession = new Date('2026-07-26T12:00:00');

  it('has no archive while every Meldung belongs to the open Session', () => {
    expect(
      resolveArchiveSession(
        [post('sommer', '2026-07-18'), post('winter', '2026-01-20')],
        duringSeededSession,
      ),
    ).toBeNull();
  });

  it('keeps a Meldung published after the Session opening in the open Session', () => {
    expect(
      resolveArchiveSession([post('nach-elften', '2025-12-01')], duringSeededSession),
    ).toBeNull();
  });

  it('names the newest Session that has older Meldungen', () => {
    expect(
      resolveArchiveSession(
        [post('uralt', '2024-02-05'), post('alt', '2025-03-10'), post('aktuell', '2026-07-18')],
        duringSeededSession,
      )?.yearsLabel,
    ).toBe('2024/25');
  });

  it('has no archive without Meldungen', () => {
    expect(resolveArchiveSession([], duringSeededSession)).toBeNull();
  });

  it('leaves the seeded Meldungen without an archive, so the button stays absent', () => {
    expect(resolveArchiveSession(NEWS_POSTS, duringSeededSession)).toBeNull();
  });
});

describe('buildArchiveLabel', () => {
  it('names the archived Session by its span', () => {
    expect(buildArchiveLabel({ number: 55, startYear: 2024, yearsLabel: '2024/25' })).toBe(
      'Archiv 2024/25',
    );
  });
});

describe('buildNewsListFooterNote', () => {
  it('closes the Session without promising an archive that does not exist', () => {
    expect(buildNewsListFooterNote(null)).toBe('Das war alles aus dieser Session.');
  });

  it('points to the archive once older Meldungen exist', () => {
    expect(buildNewsListFooterNote({ number: 55, startYear: 2024, yearsLabel: '2024/25' })).toBe(
      'Das war alles aus dieser Session. Ältere Meldungen liegen im Archiv.',
    );
  });
});

describe('buildNewsEyebrow', () => {
  it('names the Session by its span', () => {
    expect(buildNewsEyebrow('2026/27')).toBe('AUS DEM VEREIN · SESSION 2026/27');
  });

  it('derives the shipped eyebrow from the current Session', () => {
    expect(newsEyebrow).toContain(currentSession.yearsLabel);
  });
});
