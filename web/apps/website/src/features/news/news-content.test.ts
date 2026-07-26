import { kkTokens } from '@furria/ui';
import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import type { NewsPost } from './news-content';
import {
  buildArchiveLabel,
  buildNewsListFooterNote,
  buildPostByline,
  buildPostHref,
  buildWhatsAppShareUrl,
  deriveReadingTime,
  findPostBySlug,
  NEWS_POSTS,
  parseInlineBold,
  resolveArchiveSession,
  resolveCategoryContrastText,
  resolveCategoryTint,
  selectFollowingPosts,
  selectLeadPost,
  selectRelatedPosts,
  selectTeaserPosts,
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

describe('selectRelatedPosts', () => {
  it('excludes the open Meldung and keeps the newest first', () => {
    const related = selectRelatedPosts(
      [
        post('older', '2026-05-30'),
        post('open', '2026-07-18'),
        post('middle', '2026-06-14'),
        post('newer', '2026-07-04'),
      ],
      'open',
    );

    expect(related.map((newsPost) => newsPost.slug)).toEqual(['newer', 'middle', 'older']);
  });

  it('caps the Meldungen at three', () => {
    const related = selectRelatedPosts(NEWS_POSTS, 'motto-56');

    expect(related).toHaveLength(3);
    expect(related.map((newsPost) => newsPost.slug)).not.toContain('motto-56');
  });

  it('has nothing to offer beside the only Meldung', () => {
    expect(selectRelatedPosts([post('only', '2026-07-18')], 'only')).toEqual([]);
  });

  it('keeps three Meldungen when the slug matches none of them', () => {
    expect(selectRelatedPosts(NEWS_POSTS, 'gibt-es-nicht')).toHaveLength(3);
  });
});

describe('selectTeaserPosts', () => {
  it('takes the three newest Meldungen for the landing block', () => {
    const teaser = selectTeaserPosts([
      post('older', '2026-05-30'),
      post('newest', '2026-07-18'),
      post('middle', '2026-06-14'),
      post('second', '2026-07-04'),
    ]);

    expect(teaser.map((newsPost) => newsPost.slug)).toEqual(['newest', 'second', 'middle']);
  });

  it('leads the landing block with the same Meldung as the Aufmacher', () => {
    expect(selectTeaserPosts(NEWS_POSTS)[0]?.slug).toBe(selectLeadPost(NEWS_POSTS)?.slug);
  });

  it('shows fewer Meldungen instead of padding', () => {
    expect(selectTeaserPosts([post('only', '2026-07-18')])).toHaveLength(1);
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
  const words = (count: number): string => Array.from({ length: count }, () => 'Wort').join(' ');

  it('stays silent for a Meldung that is over in a moment', () => {
    expect(deriveReadingTime(['Kurz.'])).toBeNull();
  });

  it('stays silent just below three minutes', () => {
    expect(deriveReadingTime([words(360)])).toBeNull();
  });

  it('names the reading time from three minutes on', () => {
    expect(deriveReadingTime([words(361)])).toBe('3 Min. Lesezeit');
  });

  it('counts across all paragraphs of the body', () => {
    const paragraph = words(200);
    expect(deriveReadingTime([paragraph, paragraph, paragraph])).toBe('4 Min. Lesezeit');
  });

  it('leaves every seeded Meldung without a reading time, so the label stays absent', () => {
    expect(NEWS_POSTS.map((seeded) => deriveReadingTime(seeded.body))).toEqual(
      NEWS_POSTS.map(() => null),
    );
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

describe('buildPostHref', () => {
  it('gives every Meldung its own URL below the list route', () => {
    expect(buildPostHref('motto-56')).toBe('/news/motto-56');
  });
});

describe('buildPostByline', () => {
  it('names the author behind the date when the Meldung has one', () => {
    expect(buildPostByline({ ...post('motto', '2026-07-18'), author: 'Franz-Josef Besen' })).toBe(
      '18. Juli 2026 · von Franz-Josef Besen',
    );
  });

  it('omits the byline instead of inventing an institutional author', () => {
    expect(buildPostByline(post('motto', '2026-07-18'))).toBe('18. Juli 2026');
  });
});

describe('parseInlineBold', () => {
  it('keeps a paragraph without emphasis in one plain segment', () => {
    expect(parseInlineBold('Ganz ohne Auszeichnung.')).toEqual([
      { text: 'Ganz ohne Auszeichnung.', bold: false },
    ]);
  });

  it('splits an emphasised phrase out of its surrounding text', () => {
    expect(parseInlineBold('Motto: **Groß Furria hebt ab**, ab November.')).toEqual([
      { text: 'Motto: ', bold: false },
      { text: 'Groß Furria hebt ab', bold: true },
      { text: ', ab November.', bold: false },
    ]);
  });

  it('handles several emphasised phrases in order', () => {
    expect(parseInlineBold('**5. August**, immer **20:00 Uhr**')).toEqual([
      { text: '5. August', bold: true },
      { text: ', immer ', bold: false },
      { text: '20:00 Uhr', bold: true },
    ]);
  });

  it('keeps an unmatched marker as literal text', () => {
    expect(parseInlineBold('Zwei Sterne **ohne Ende')).toEqual([
      { text: 'Zwei Sterne ', bold: false },
      { text: '**ohne Ende', bold: false },
    ]);
  });

  it('keeps the trailing marker literal after a closed pair', () => {
    expect(parseInlineBold('**fett** und **offen')).toEqual([
      { text: 'fett', bold: true },
      { text: ' und ', bold: false },
      { text: '**offen', bold: false },
    ]);
  });

  it('drops empty segments', () => {
    expect(parseInlineBold('')).toEqual([]);
    expect(parseInlineBold('****')).toEqual([]);
  });
});

describe('buildWhatsAppShareUrl', () => {
  it('percent-encodes title and URL into the wa.me text parameter', () => {
    expect(
      buildWhatsAppShareUrl('Das Motto der 56. Session steht', 'https://furria.de/news/motto-56'),
    ).toBe(
      'https://wa.me/?text=Das%20Motto%20der%2056.%20Session%20steht%0Ahttps%3A%2F%2Ffurria.de%2Fnews%2Fmotto-56',
    );
  });

  it('encodes German umlauts and ampersands so the link survives WhatsApp', () => {
    expect(buildWhatsAppShareUrl('Größer & lauter', 'https://furria.de/news/a?b=c')).toBe(
      'https://wa.me/?text=Gr%C3%B6%C3%9Fer%20%26%20lauter%0Ahttps%3A%2F%2Ffurria.de%2Fnews%2Fa%3Fb%3Dc',
    );
  });
});
