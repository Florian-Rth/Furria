import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActMusicPage } from '@/features/act-studio/components/ActMusicPage';
import { ActMusicSearchSchema } from '@/features/act-studio/schemas';

const ActMusicRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <ActMusicPage actId={actId} search={search} />;
};

export const Route = createFileRoute('/_app/acts_/$actId_/musik')({
  validateSearch: ActMusicSearchSchema,
  component: ActMusicRoute,
});
