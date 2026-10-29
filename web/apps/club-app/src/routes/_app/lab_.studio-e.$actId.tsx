import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { StudioEPage } from '@/features/lab-studio-e/components/StudioEPage';

const StudioERoute: FC = () => {
  const { actId } = Route.useParams();

  return <StudioEPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/studio-e/$actId')({
  component: StudioERoute,
});
