import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { TablePlannerPage } from '@/features/table-planner/components/TablePlannerPage';

const TablePlannerRoute: FC = () => {
  const { eventId } = Route.useParams();

  return <TablePlannerPage eventId={eventId} />;
};

export const Route = createFileRoute('/_app/events_/$eventId_/table-plan')({
  component: TablePlannerRoute,
});
