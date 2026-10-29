import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { StudioBPage } from '@/features/lab-studio-b/components/StudioBPage';

const StudioBRoute: FC = () => {
  const { actId } = Route.useParams();

  return <StudioBPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/studio-b/$actId')({ component: StudioBRoute });
