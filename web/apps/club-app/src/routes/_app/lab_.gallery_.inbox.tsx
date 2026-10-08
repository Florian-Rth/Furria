import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GalleryInboxPage, InboxSearchSchema } from '@/features/gallery-lab';

const GalleryInboxLabRoute: FC = () => {
  const { left } = Route.useSearch();

  return <GalleryInboxPage left={left} />;
};

export const Route = createFileRoute('/_app/lab_/gallery_/inbox')({
  validateSearch: InboxSearchSchema,
  component: GalleryInboxLabRoute,
});
