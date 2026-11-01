import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppFailure } from '@/features/session/components/AppFailure';
import { LinkUploadScreen } from '@/features/upload-links/components/LinkUploadScreen';
import { useLinkArrival } from '@/lib/use-link-arrival';

const PhotosRoute: FC = () => {
  const arrival = useLinkArrival();

  return <LinkUploadScreen key={arrival} />;
};

export const Route = createFileRoute('/photos')({
  component: PhotosRoute,
  errorComponent: AppFailure,
});
