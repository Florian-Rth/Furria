import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PassGroupPage } from '@/features/lab-act-a/components/PassGroupPage';

const PassGroupLabRoute: FC = () => {
  const { groupId } = Route.useParams();

  return <PassGroupPage groupId={groupId} />;
};

export const Route = createFileRoute('/_app/lab_/act-a/group/$groupId')({
  component: PassGroupLabRoute,
});
