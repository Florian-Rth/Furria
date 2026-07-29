import { createFileRoute, notFound } from '@tanstack/react-router';
import type { FC } from 'react';
import type { Album } from '@/features/gallery';
import {
  ALBUMS,
  AlbumPage,
  AlbumSearchSchema,
  buildAlbumDocumentTitle,
  buildAlbumHref,
  findAlbumBySlug,
} from '@/features/gallery';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const AlbumComponent: FC = () => <AlbumPage album={Route.useLoaderData()} />;

const buildAlbumHead = (album: Album): RouteHead => {
  const title = pageTitle(buildAlbumDocumentTitle(album));

  return {
    meta: [
      { title },
      { name: 'description', content: album.intro },
      { property: 'og:title', content: title },
      { property: 'og:description', content: album.intro },
    ],
    links: [{ rel: 'canonical', href: buildAlbumHref(album.slug) }],
  };
};

export const Route = createFileRoute('/_site/_gated/gallery_/$albumSlug')({
  validateSearch: AlbumSearchSchema,
  loader: ({ params }): Album => {
    const album = findAlbumBySlug(ALBUMS, params.albumSlug);
    if (album === undefined) {
      throw notFound();
    }
    return album;
  },
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildAlbumHead(loaderData),
  component: AlbumComponent,
});
