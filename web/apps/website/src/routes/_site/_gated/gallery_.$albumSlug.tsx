import { createFileRoute, notFound, redirect, useRouter } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  AlbumPage,
  AlbumSearchSchema,
  buildAlbumDescription,
  buildAlbumDocumentTitle,
  buildAlbumHref,
  buildAlbumSlug,
  GalleryUnavailable,
} from '@/features/gallery';
import { ApiError } from '@/lib/api/errors';
import { readSlugId } from '@/lib/id-slug';
import { ensurePublicAlbum, ensurePublicGallery } from '@/lib/public-gallery/api';
import type { AlbumDetail } from '@/lib/public-gallery/schemas';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const NOT_FOUND_STATUS = 404;

const AlbumComponent: FC = () => <AlbumPage album={Route.useLoaderData()} />;

const AlbumErrorComponent: FC = () => {
  const router = useRouter();

  const retry = (): void => {
    void router.invalidate();
  };

  return <GalleryUnavailable onRetry={retry} />;
};

const buildShareImageMeta = (album: AlbumDetail): RouteHead['meta'] =>
  album.photos.slice(0, 1).map((photo) => ({ property: 'og:image', content: photo.largeUrl }));

const buildAlbumHead = (album: AlbumDetail): RouteHead => {
  const title = pageTitle(buildAlbumDocumentTitle(album));
  const description = buildAlbumDescription(album);

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      ...buildShareImageMeta(album),
    ],
    links: [{ rel: 'canonical', href: buildAlbumHref(album) }],
  };
};

const loadAlbum = async (albumId: number): Promise<AlbumDetail> => {
  try {
    return await ensurePublicAlbum(albumId);
  } catch (error) {
    if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
      throw notFound();
    }
    throw error;
  }
};

export const Route = createFileRoute('/_site/_gated/gallery_/$albumSlug')({
  validateSearch: AlbumSearchSchema,
  loader: async ({ params }): Promise<AlbumDetail> => {
    const albumId = readSlugId(params.albumSlug);
    if (albumId === null) {
      throw notFound();
    }

    void ensurePublicGallery().catch((): null => null);
    const album = await loadAlbum(albumId);
    const canonicalSlug = buildAlbumSlug(album);
    if (params.albumSlug !== canonicalSlug) {
      throw redirect({
        to: '/gallery/$albumSlug',
        params: { albumSlug: canonicalSlug },
        search: true,
        replace: true,
      });
    }
    return album;
  },
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildAlbumHead(loaderData),
  errorComponent: AlbumErrorComponent,
  component: AlbumComponent,
});
