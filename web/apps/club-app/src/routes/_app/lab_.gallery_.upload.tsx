import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GalleryUploadPage, UploadSearchSchema } from '@/features/gallery-lab';

const GalleryUploadLabRoute: FC = () => {
  const { net } = Route.useSearch();

  return <GalleryUploadPage offline={net === 'off'} />;
};

export const Route = createFileRoute('/_app/lab_/gallery_/upload')({
  validateSearch: UploadSearchSchema,
  component: GalleryUploadLabRoute,
});
