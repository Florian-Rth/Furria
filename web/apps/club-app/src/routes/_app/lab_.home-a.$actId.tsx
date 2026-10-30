import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { TwinPage } from '@/features/lab-home-a/components/TwinPage';

const TwinRoute: FC = () => {
  const { actId } = Route.useParams();

  return <TwinPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/home-a/$actId')({
  component: TwinRoute,
});
