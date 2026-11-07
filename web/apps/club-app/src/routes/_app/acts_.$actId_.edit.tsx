import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActPracticePage } from '@/features/acts/components/ActPracticePage';
import { ActScreenSearchSchema } from '@/features/acts/schemas';

const ActEditRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <ActPracticePage actId={actId} eventId={null} editing search={search} />;
};

export const Route = createFileRoute('/_app/acts_/$actId_/edit')({
  validateSearch: ActScreenSearchSchema,
  component: ActEditRoute,
});
