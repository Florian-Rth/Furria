import { createFileRoute } from '@tanstack/react-router';
import { GroupAdminScreen } from '@/features/group-hub';

export const Route = createFileRoute('/_app/groups_/$groupId_/admins/$adminId')({
  component: GroupAdminScreen,
});
