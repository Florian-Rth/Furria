import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActMusicPage } from '@/features/act-studio/components/ActMusicPage';
import { ActScreenSearchSchema } from '@/features/acts/schemas';

const ActMusicRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <ActMusicPage actId={actId} tool="music" search={search} />;
};

export const Route = createFileRoute('/_app/acts_/$actId_/music')({
  validateSearch: ActScreenSearchSchema,
  component: ActMusicRoute,
});
