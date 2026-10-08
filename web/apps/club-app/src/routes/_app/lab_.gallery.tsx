import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GalleryHubPage, GallerySearchSchema } from '@/features/gallery-lab';

const GalleryLabRoute: FC = () => {
  const { persona } = Route.useSearch();

  return <GalleryHubPage view={persona ?? 'manage'} />;
};

export const Route = createFileRoute('/_app/lab_/gallery')({
  validateSearch: GallerySearchSchema,
  component: GalleryLabRoute,
});
