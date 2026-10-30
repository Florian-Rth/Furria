import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { StudioGPage } from '@/features/lab-studio-g/components/StudioGPage';

const StudioGRoute: FC = () => {
  const { actId } = Route.useParams();

  return <StudioGPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/studio-g/$actId')({
  component: StudioGRoute,
});
