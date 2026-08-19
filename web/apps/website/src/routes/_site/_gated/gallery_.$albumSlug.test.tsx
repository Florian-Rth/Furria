import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Album } from '@/features/gallery';
import {
  ALBUMS,
  buildAlbumDocumentTitle,
  buildPhotoPlaceholderLabel,
  findAlbumBySlug,
} from '@/features/gallery';
import { writeGrantedToSession } from '@/features/preview-access';
import { pageTitle } from '@/lib/seo';
import { markChangelogSeen } from '@/test/changelog';
import { headContent } from '@/test/head';
import { renderAtRoute } from '@/test/render';

beforeEach(() => {
  markChangelogSeen();
});

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

const KNOWN_SLUG = 'prunksitzung-2026';

const seededAlbum = (slug: string): Album => {
  const album = findAlbumBySlug(ALBUMS, slug);
  if (album === undefined) {
    throw new Error(`missing seeded Album: ${slug}`);
  }
  return album;
};

describe('album route', () => {
  it('renders the Album behind a known slug', async () => {
    const album = seededAlbum(KNOWN_SLUG);
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute(`/gallery/${KNOWN_SLUG}`);

    expect(await screen.findByRole('heading', { level: 1, name: album.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Alle Alben' })).toHaveAttribute('href', '/gallery');
  });

  it('lays the photos out in the order the Album curates them', async () => {
    const album = seededAlbum(KNOWN_SLUG);
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute(`/gallery/${KNOWN_SLUG}`);

    await screen.findByRole('heading', { level: 1, name: album.title });

    const renderedPhotos = [...document.querySelectorAll('[data-kk-photo-grid-cell]')].map(
      (cell) => cell.textContent,
    );

    expect(renderedPhotos).toEqual(
      album.photos.map((_, index) => buildPhotoPlaceholderLabel(album, index)),
    );
  });

  it('closes on the next Album, wrapping from the oldest one to the newest', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/gallery/prunksitzung-2025');

    expect(
      await screen.findByRole('heading', { level: 2, name: 'NÄCHSTES ALBUM' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Rosenmontagsumzug' })).toHaveAttribute(
      'href',
      '/gallery/rosenmontagsumzug-2026',
    );
    expect(
      screen.queryByRole('link', { name: 'Zu den Veranstaltungen →' }),
    ).not.toBeInTheDocument();
  });

  it('publishes a per-Album document head that ignores the viewer search param', async () => {
    const album = seededAlbum(KNOWN_SLUG);
    const title = pageTitle(buildAlbumDocumentTitle(album));
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute(`/gallery/${KNOWN_SLUG}?photo=3`);

    await screen.findByRole('dialog');

    expect(document.title).toBe(title);
    expect(headContent('meta[name="description"]', 'content')).toBe(album.intro);
    expect(headContent('meta[property="og:title"]', 'content')).toBe(title);
    expect(headContent('meta[property="og:description"]', 'content')).toBe(album.intro);
    expect(headContent('meta[property="og:type"]', 'content')).toBe('website');
    expect(headContent('link[rel="canonical"]', 'href')).toBe(`/gallery/${KNOWN_SLUG}`);
  });

  it('shows the branded 404 for an unknown Album slug', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/gallery/gibt-es-hier-nicht');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'HIER WAR MAL EINE SEITE.' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '← Alle Alben' })).not.toBeInTheDocument();
  });
});
