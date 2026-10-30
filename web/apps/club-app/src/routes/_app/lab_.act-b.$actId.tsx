import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AgendaActPage } from '@/features/lab-act-b/components/AgendaActPage';
import { AgendaSearchSchema } from '@/features/lab-act-b/schemas';

const AgendaActRoute: FC = () => {
  const { actId } = Route.useParams();
  const { view } = Route.useSearch();

  return <AgendaActPage actId={actId} view={view} />;
};

export const Route = createFileRoute('/_app/lab_/act-b/$actId')({
  validateSearch: AgendaSearchSchema,
  component: AgendaActRoute,
});
