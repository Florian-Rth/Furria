import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import type { NewsCategory, NewsPost } from './news-content';
import {
  buildNewsListFooterNote,
  buildPostByline,
  buildWhatsAppShareUrl,
  deriveReadingTime,
  parseInlineBold,
  resolveArchiveSession,
  resolveCategoryContrastText,
  resolveCategoryTint,
  selectFollowingPosts,
  selectLeadPost,
  selectRelatedPosts,
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

const words = (count: number): string => Array.from({ length: count }, () => 'Wort').join(' ');

const theme = createTheme();

const archiveSession = { number: 55, startYear: 2024, yearsLabel: '2024/25' };

describe('sortPostsByDateDesc', () => {
  it('sorts a copy of the Meldungen, newest first', () => {
    const posts = [post('older', '2026-05-30'), post('newest', '2026-07-18')];

    expect(sortPostsByDateDesc(posts).map((entry) => entry.slug)).toEqual(['newest', 'older']);
    expect(posts.map((entry) => entry.slug)).toEqual(['older', 'newest']);
  });
});

describe('selectLeadPost and selectFollowingPosts', () => {
  it('partitions the Meldungen into the newest and the rest', () => {
    const posts = [
      post('older', '2026-05-30'),
      post('newest', '2026-07-18'),
      post('middle', '2026-06-14'),
    ];

    expect(selectLeadPost(posts)?.slug).toBe('newest');
    expect(selectFollowingPosts(posts).map((entry) => entry.slug)).toEqual(['middle', 'older']);
  });

  it('has no Aufmacher without Meldungen', () => {
    expect(selectLeadPost([])).toBeUndefined();
  });
});

describe('selectRelatedPosts', () => {
  it('excludes the open Meldung and caps the rest at three, newest first', () => {
    const related = selectRelatedPosts(
      [
        post('oldest', '2026-05-30'),
        post('open', '2026-07-18'),
        post('middle', '2026-06-14'),
        post('newer', '2026-07-04'),
        post('older', '2026-06-01'),
      ],
      'open',
    );

    expect(related.map((entry) => entry.slug)).toEqual(['newer', 'middle', 'older']);
  });
});

describe('resolveCategoryTint', () => {
  it('tints the two loud categories and inks the institutional ones', () => {
    const tintOf = (category: NewsCategory): string => resolveCategoryTint(theme, category);

    expect(tintOf('Session')).toBe(theme.palette.primary.main);
    expect(tintOf('Erfolge')).toBe(theme.palette.warning.main);
    expect(tintOf('Verein')).toBe(theme.palette.text.primary);
    expect(tintOf('Gruppen')).toBe(theme.palette.text.primary);
  });
});

describe('resolveCategoryContrastText', () => {
  it('reads the contrast off the tinted entry and flips the ink against the page', () => {
    const contrastOf = (category: NewsCategory): string =>
      resolveCategoryContrastText(theme, category);

    expect(contrastOf('Session')).toBe(theme.palette.primary.contrastText);
    expect(contrastOf('Erfolge')).toBe(theme.palette.warning.contrastText);
    expect(contrastOf('Verein')).toBe(theme.palette.background.default);
  });
});

describe('resolveArchiveSession', () => {
  const duringOpenSession = new Date('2026-07-26T12:00:00');

  it('has no archive while every Meldung belongs to the open Session', () => {
    expect(
      resolveArchiveSession(
        [post('sommer', '2026-07-18'), post('winter', '2026-01-20')],
        duringOpenSession,
      ),
    ).toBeNull();
  });

  it('names the newest Session that has older Meldungen', () => {
    expect(
      resolveArchiveSession(
        [post('uralt', '2024-02-05'), post('alt', '2025-03-10'), post('aktuell', '2026-07-18')],
        duringOpenSession,
      )?.yearsLabel,
    ).toBe('2024/25');
  });
});

describe('buildNewsListFooterNote', () => {
  it('extends the closing note only once an archive exists', () => {
    const withoutArchive = buildNewsListFooterNote(null);
    const withArchive = buildNewsListFooterNote(archiveSession);

    expect(withArchive.startsWith(withoutArchive)).toBe(true);
    expect(withArchive.length).toBeGreaterThan(withoutArchive.length);
  });
});

describe('deriveReadingTime', () => {
  it('stays silent below the three-minute threshold', () => {
    expect(deriveReadingTime(['Kurz.'])).toBeNull();
    expect(deriveReadingTime([words(360)])).toBeNull();
  });

  it('counts the words across every paragraph of the body', () => {
    expect(deriveReadingTime([words(361)])).toBe('3 Min. Lesezeit');
    expect(deriveReadingTime([words(200), words(200), words(200)])).toBe('4 Min. Lesezeit');
  });
});

describe('buildPostByline', () => {
  it('appends the author only when the Meldung names one', () => {
    const anonymous = buildPostByline(post('motto', '2026-07-18'));
    const attributed = buildPostByline({
      ...post('motto', '2026-07-18'),
      author: 'Franz-Josef Besen',
    });

    expect(anonymous).toBe('18. Juli 2026');
    expect(attributed).toContain(anonymous);
    expect(attributed).toContain('Franz-Josef Besen');
  });
});

describe('parseInlineBold', () => {
  it.each([
    ['Ganz ohne Auszeichnung.', [{ text: 'Ganz ohne Auszeichnung.', bold: false }]],
    [
      'Motto: **Groß Furria hebt ab**, ab November.',
      [
        { text: 'Motto: ', bold: false },
        { text: 'Groß Furria hebt ab', bold: true },
        { text: ', ab November.', bold: false },
      ],
    ],
    [
      '**5. August**, immer **20:00 Uhr**',
      [
        { text: '5. August', bold: true },
        { text: ', immer ', bold: false },
        { text: '20:00 Uhr', bold: true },
      ],
    ],
    [
      'Zwei Sterne **ohne Ende',
      [
        { text: 'Zwei Sterne ', bold: false },
        { text: '**ohne Ende', bold: false },
      ],
    ],
    [
      '**fett** und **offen',
      [
        { text: 'fett', bold: true },
        { text: ' und ', bold: false },
        { text: '**offen', bold: false },
      ],
    ],
    ['', []],
    ['****', []],
  ])('parses %j', (paragraph, segments) => {
    expect(parseInlineBold(paragraph)).toEqual(segments);
  });
});

describe('buildWhatsAppShareUrl', () => {
  it('percent-encodes umlauts, ampersands and the newline between title and URL', () => {
    expect(buildWhatsAppShareUrl('Größer & lauter', 'https://furria.de/news/a?b=c')).toBe(
      'https://wa.me/?text=Gr%C3%B6%C3%9Fer%20%26%20lauter%0Ahttps%3A%2F%2Ffurria.de%2Fnews%2Fa%3Fb%3Dc',
    );
  });
});
