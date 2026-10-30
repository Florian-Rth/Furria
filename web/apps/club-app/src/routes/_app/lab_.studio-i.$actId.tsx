import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { StudioIPage } from '@/features/lab-studio-i/components/StudioIPage';

const StudioIRoute: FC = () => {
  const { actId } = Route.useParams();

  return <StudioIPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/studio-i/$actId')({
  component: StudioIRoute,
});
