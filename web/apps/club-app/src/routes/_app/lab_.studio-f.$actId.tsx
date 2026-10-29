import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { StudioFPage } from '@/features/lab-studio-f/components/StudioFPage';

const StudioFRoute: FC = () => {
  const { actId } = Route.useParams();

  return <StudioFPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/studio-f/$actId')({
  component: StudioFRoute,
});
