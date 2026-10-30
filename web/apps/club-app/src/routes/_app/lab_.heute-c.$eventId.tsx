import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { HeuteCPage } from '@/features/lab-heute-c/components/HeuteCPage';

const HeuteCRoute: FC = () => {
  const { eventId } = Route.useParams();

  return <HeuteCPage eventId={eventId} />;
};

export const Route = createFileRoute('/_app/lab_/heute-c/$eventId')({
  component: HeuteCRoute,
});
