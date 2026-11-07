import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActMusicPage } from '@/features/act-studio/components/ActMusicPage';
import { ActScreenSearchSchema } from '@/features/acts/schemas';

const ActVideosRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <ActMusicPage actId={actId} tool="video" search={search} />;
};

export const Route = createFileRoute('/_app/acts_/$actId_/videos')({
  validateSearch: ActScreenSearchSchema,
  component: ActVideosRoute,
});
