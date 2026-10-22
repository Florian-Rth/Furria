import { createFileRoute } from '@tanstack/react-router';
import { GroupAdminScreen } from '@/features/group-hub/components/GroupAdminScreen';

export const Route = createFileRoute('/_app/groups_/$groupId_/admins/$adminId')({
  component: GroupAdminScreen,
});
