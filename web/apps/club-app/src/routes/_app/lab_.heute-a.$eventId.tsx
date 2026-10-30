import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { HeuteAPage } from '@/features/lab-heute-a/components/HeuteAPage';

const HeuteARoute: FC = () => {
  const { eventId } = Route.useParams();

  return <HeuteAPage eventId={eventId} />;
};

export const Route = createFileRoute('/_app/lab_/heute-a/$eventId')({
  component: HeuteARoute,
});
