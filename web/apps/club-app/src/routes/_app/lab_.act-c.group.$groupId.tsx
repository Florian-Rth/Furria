import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActCGroupPage } from '@/features/lab-act-c/components/ActCGroupPage';

const ActCGroupRoute: FC = () => {
  const { groupId } = Route.useParams();

  return <ActCGroupPage groupId={groupId} />;
};

export const Route = createFileRoute('/_app/lab_/act-c/group/$groupId')({
  component: ActCGroupRoute,
});
