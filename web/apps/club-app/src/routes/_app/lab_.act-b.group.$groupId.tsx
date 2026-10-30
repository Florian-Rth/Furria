import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GroupAgendaPage } from '@/features/lab-act-b/components/GroupAgendaPage';

const GroupAgendaRoute: FC = () => {
  const { groupId } = Route.useParams();

  return <GroupAgendaPage groupId={groupId} />;
};

export const Route = createFileRoute('/_app/lab_/act-b/group/$groupId')({
  component: GroupAgendaRoute,
});
