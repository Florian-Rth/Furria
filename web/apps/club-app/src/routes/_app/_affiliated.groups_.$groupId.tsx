import { createFileRoute } from '@tanstack/react-router';
import { GroupPage } from '@/features/groups';

export const Route = createFileRoute('/_app/_affiliated/groups_/$groupId')({
  component: GroupPage,
});
