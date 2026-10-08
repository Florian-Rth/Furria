import { createFileRoute, notFound } from '@tanstack/react-router';
import type { FC } from 'react';
import { AlbumSearchSchema, GalleryAlbumPage, labAlbumOf } from '@/features/gallery-lab';

const GalleryAlbumLabRoute: FC = () => {
  const { album } = Route.useLoaderData();
  const search = Route.useSearch();

  return <GalleryAlbumPage album={album} search={search} view={search.persona ?? 'manage'} />;
};

export const Route = createFileRoute('/_app/lab_/gallery_/$albumId')({
  validateSearch: AlbumSearchSchema,
  loader: ({ params }) => {
    const album = labAlbumOf(params.albumId);

    if (album === null) {
      throw notFound();
    }

    return { album };
  },
  component: GalleryAlbumLabRoute,
});
