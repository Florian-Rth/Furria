import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { StudioAPage } from '@/features/lab-studio-a/components/StudioAPage';

const StudioARoute: FC = () => {
  const { actId } = Route.useParams();

  return <StudioAPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/studio-a/$actId')({
  component: StudioARoute,
});
