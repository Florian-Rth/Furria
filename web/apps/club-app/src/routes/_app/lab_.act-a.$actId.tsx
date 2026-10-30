import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PassActPage } from '@/features/lab-act-a/components/PassActPage';

const PassActLabRoute: FC = () => {
  const { actId } = Route.useParams();

  return <PassActPage actId={actId} />;
};

export const Route = createFileRoute('/_app/lab_/act-a/$actId')({
  component: PassActLabRoute,
});
