import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { StudioDPage } from '@/features/lab-studio-d/components/StudioDPage';

const StudioDRoute: FC = () => {
  const { actId } = Route.useParams();

  return <StudioDPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/studio-d/$actId')({
  component: StudioDRoute,
});
