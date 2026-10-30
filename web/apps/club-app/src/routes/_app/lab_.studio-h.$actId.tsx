import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { StudioHPage } from '@/features/lab-studio-h/components/StudioHPage';

const StudioHRoute: FC = () => {
  const { actId } = Route.useParams();

  return <StudioHPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/studio-h/$actId')({
  component: StudioHRoute,
});
