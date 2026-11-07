import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActDetailsPage } from '@/features/acts/components/ActDetailsPage';
import { ActScreenSearchSchema } from '@/features/acts/schemas';

const ActDetailsRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <ActDetailsPage actId={actId} search={search} />;
};

export const Route = createFileRoute('/_app/acts_/$actId_/details')({
  validateSearch: ActScreenSearchSchema,
  component: ActDetailsRoute,
});
