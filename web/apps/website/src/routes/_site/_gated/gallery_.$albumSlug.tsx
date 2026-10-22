import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';
import { AlbumPage } from '@/features/gallery/components/AlbumPage/AlbumPage';
import { GalleryUnavailable } from '@/features/gallery/components/GalleryUnavailable';
import {
  buildAlbumDescription,
  buildAlbumDocumentTitle,
  buildAlbumHref,
} from '@/features/gallery/gallery-content';
import { AlbumSearchSchema } from '@/features/gallery/schemas';
import { publicGallery } from '@/lib/public-gallery/api';
import type { AlbumDetail } from '@/lib/public-gallery/schemas';
import { loadCanonicalDetail } from '@/lib/public-resource/canonical-detail';
import { useRouteRetry } from '@/lib/public-resource/use-route-retry';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const AlbumComponent: FC = () => <AlbumPage album={Route.useLoaderData()} />;

const AlbumErrorComponent: FC = () => {
  const retry = useRouteRetry();

  return <GalleryUnavailable onRetry={retry} />;
};

const buildShareImageMeta = (album: AlbumDetail): RouteHead['meta'] =>
  album.photos.slice(0, 1).flatMap((photo) => [
    { property: 'og:image', content: photo.largeUrl },
    { property: 'og:image:alt', content: album.title },
  ]);

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

export const Route = createFileRoute('/_site/_gated/gallery_/$albumSlug')({
  validateSearch: AlbumSearchSchema,
  loader: ({ params }): Promise<AlbumDetail> => {
    void publicGallery.ensure().catch((): null => null);

    return loadCanonicalDetail(publicGallery, params.albumSlug, (albumSlug) =>
      redirect({
        to: '/gallery/$albumSlug',
        params: { albumSlug },
        search: true,
        replace: true,
      }),
    );
  },
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildAlbumHead(loaderData),
  errorComponent: AlbumErrorComponent,
  component: AlbumComponent,
});
