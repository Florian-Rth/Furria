import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActPage } from '@/features/acts/components/ActPage';
import { ActPageSearchSchema } from '@/features/acts/schemas';

const ActRoute: FC = () => {
  const { actId } = Route.useParams();
  const search = Route.useSearch();

  return <ActPage actId={actId} search={search} />;
};

export const Route = createFileRoute('/_app/acts_/$actId')({
  validateSearch: ActPageSearchSchema,
  component: ActRoute,
});
