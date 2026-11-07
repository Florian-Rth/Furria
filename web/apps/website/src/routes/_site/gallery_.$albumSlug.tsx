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
import type { RouteHead } from '@/lib/seo/route-head';
import { indexablePageHead, pageTitle, shareImageMeta } from '@/lib/seo/route-head';

const AlbumComponent: FC = () => <AlbumPage album={Route.useLoaderData()} />;

const AlbumErrorComponent: FC = () => {
  const retry = useRouteRetry();

  return <GalleryUnavailable onRetry={retry} />;
};

const buildShareImageMeta = (album: AlbumDetail): RouteHead['meta'] =>
  album.photos.slice(0, 1).flatMap((photo) => shareImageMeta(photo.largeUrl, album.title));

const buildAlbumHead = (album: AlbumDetail): RouteHead => {
  const head = indexablePageHead({
    path: buildAlbumHref(album),
    title: pageTitle(buildAlbumDocumentTitle(album)),
    description: buildAlbumDescription(album),
  });

  return { ...head, meta: [...head.meta, ...buildShareImageMeta(album)] };
};

export const Route = createFileRoute('/_site/gallery_/$albumSlug')({
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
