import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActPracticePage } from '@/features/acts/components/ActPracticePage';
import { ActScreenSearchSchema } from '@/features/acts/schemas';

const ActEveningEditRoute: FC = () => {
  const { actId, eventId } = Route.useParams();
  const search = Route.useSearch();

  return <ActPracticePage actId={actId} eventId={eventId} editing search={search} />;
};

export const Route = createFileRoute('/_app/acts_/$actId_/evenings/$eventId/edit')({
  validateSearch: ActScreenSearchSchema,
  component: ActEveningEditRoute,
});
