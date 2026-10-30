import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActCPage } from '@/features/lab-act-c/components/ActCPage';

const ActCRoute: FC = () => {
  const { actId } = Route.useParams();

  return <ActCPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/act-c/$actId')({
  component: ActCRoute,
});
