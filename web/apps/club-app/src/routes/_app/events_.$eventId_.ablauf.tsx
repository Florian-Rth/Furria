import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { RunningOrderPage } from '@/features/running-order/components/RunningOrderPage';
import { RunningOrderSearchSchema } from '@/features/running-order/schemas';

const RunningOrderRoute: FC = () => {
  const { eventId } = Route.useParams();

  return <RunningOrderPage eventId={eventId} />;
};

export const Route = createFileRoute('/_app/events_/$eventId_/ablauf')({
  validateSearch: RunningOrderSearchSchema,
  component: RunningOrderRoute,
});
