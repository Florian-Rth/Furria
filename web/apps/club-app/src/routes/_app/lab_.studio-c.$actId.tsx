import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { StudioCPage } from '@/features/lab-studio-c/components/StudioCPage';

const StudioCRoute: FC = () => {
  const { actId } = Route.useParams();

  return <StudioCPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/studio-c/$actId')({
  component: StudioCRoute,
});
