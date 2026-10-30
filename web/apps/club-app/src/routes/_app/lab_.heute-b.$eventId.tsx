import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { HeuteBPage } from '@/features/lab-heute-b/components/HeuteBPage';

const HeuteBRoute: FC = () => {
  const { eventId } = Route.useParams();

  return <HeuteBPage eventId={eventId} />;
};

export const Route = createFileRoute('/_app/lab_/heute-b/$eventId')({
  component: HeuteBRoute,
});
