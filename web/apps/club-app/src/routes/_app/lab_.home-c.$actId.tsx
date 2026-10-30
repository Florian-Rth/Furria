import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { WayPage } from '@/features/lab-home-c/components/WayPage';

const WayRoute: FC = () => {
  const { actId } = Route.useParams();

  return <WayPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/home-c/$actId')({
  component: WayRoute,
});
