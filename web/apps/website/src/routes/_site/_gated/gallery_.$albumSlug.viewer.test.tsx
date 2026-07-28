import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Album, Photo } from '@/features/gallery';
import { ALBUMS, buildPhotoOpenLabel, findAlbumBySlug } from '@/features/gallery';
import { writeGrantedToSession } from '@/features/preview-access';
import { markChangelogSeen } from '@/test/changelog';
import { renderAtRoute } from '@/test/render';

beforeEach(() => {
  markChangelogSeen();
});

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

const KNOWN_SLUG = 'prunksitzung-2026';

const seededAlbum = (): Album => {
  const album = findAlbumBySlug(ALBUMS, KNOWN_SLUG);
  if (album === undefined) {
    throw new Error(`missing seeded Album: ${KNOWN_SLUG}`);
  }
  return album;
};

const photoAt = (album: Album, index: number): Photo => {
  const photo = album.photos[index];
  if (photo === undefined) {
    throw new Error(`missing seeded photo: ${index}`);
  }
  return photo;
};

const openAlbum = (search = ''): void => {
  writeGrantedToSession(window.sessionStorage);
  renderAtRoute(`/gallery/${KNOWN_SLUG}${search}`);
};

const awaitAlbumPage = async (album: Album): Promise<void> => {
  await screen.findByRole('heading', { level: 1, name: album.title });
};

describe('photo viewer', () => {
  it('stays closed until a photo is opened', async () => {
    const album = seededAlbum();
    openAlbum();

    await awaitAlbumPage(album);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on the photo the URL addresses', async () => {
    const album = seededAlbum();
    openAlbum('?photo=2');

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent(`2 von ${album.photos.length}`);
    expect(dialog).toHaveTextContent(photoAt(album, 1).alt);
    expect(dialog).toHaveTextContent(album.venue);
  });

  it('stays closed for a photo number the Album does not have', async () => {
    const album = seededAlbum();
    openAlbum('?photo=99');

    await awaitAlbumPage(album);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('stays closed for a garbage photo param', async () => {
    const album = seededAlbum();
    openAlbum('?photo=zwoelf');

    await awaitAlbumPage(album);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens from a tile and returns focus to it when closed', async () => {
    const user = userEvent.setup();
    const album = seededAlbum();
    openAlbum();

    await awaitAlbumPage(album);

    const tile = screen.getByRole('button', { name: buildPhotoOpenLabel(photoAt(album, 2)) });
    await user.click(tile);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent(`3 von ${album.photos.length}`);

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(tile).toHaveFocus();
  });

  it('clamps at the first photo and disables the step back', async () => {
    openAlbum('?photo=1');

    await screen.findByRole('dialog');

    expect(screen.getByRole('button', { name: 'Vorheriges Foto' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Nächstes Foto' })).toBeEnabled();
  });

  it('clamps at the last photo and disables the step forward', async () => {
    const album = seededAlbum();
    openAlbum(`?photo=${album.photos.length}`);

    await screen.findByRole('dialog');

    expect(screen.getByRole('button', { name: 'Vorheriges Foto' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Nächstes Foto' })).toBeDisabled();
  });

  it('steps with the arrow keys', async () => {
    const user = userEvent.setup();
    const album = seededAlbum();
    openAlbum('?photo=4');

    const dialog = await screen.findByRole('dialog');

    await user.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(dialog).toHaveTextContent(`5 von ${album.photos.length}`);
    });

    await user.keyboard('{ArrowLeft}');
    await waitFor(() => {
      expect(dialog).toHaveTextContent(`4 von ${album.photos.length}`);
    });
  });

  it('leaves one history entry behind so Back closes the viewer', async () => {
    const user = userEvent.setup();
    const album = seededAlbum();
    writeGrantedToSession(window.sessionStorage);
    const { history } = renderAtRoute(`/gallery/${KNOWN_SLUG}`);

    await awaitAlbumPage(album);

    await user.click(screen.getByRole('button', { name: buildPhotoOpenLabel(photoAt(album, 0)) }));
    const dialog = await screen.findByRole('dialog');
    expect(history.location.href).toContain('photo=1');

    await user.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(dialog).toHaveTextContent(`2 von ${album.photos.length}`);
    });
    await user.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(dialog).toHaveTextContent(`3 von ${album.photos.length}`);
    });
    expect(history.location.href).toContain('photo=3');
    expect(history.location.pathname).toBe(`/gallery/${KNOWN_SLUG}`);

    act(() => {
      history.back();
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await awaitAlbumPage(album);
  });
});
