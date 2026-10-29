import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActsPage } from '@/features/acts/components/ActsPage';
import { ActsSearchSchema } from '@/features/acts/schemas';

const ActsRoute: FC = () => {
  const search = Route.useSearch();

  return <ActsPage search={search} />;
};

export const Route = createFileRoute('/_app/acts')({
  validateSearch: ActsSearchSchema,
  component: ActsRoute,
});
