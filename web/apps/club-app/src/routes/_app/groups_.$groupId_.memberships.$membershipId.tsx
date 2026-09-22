import { createFileRoute } from '@tanstack/react-router';
import { GroupMembershipScreen } from '@/features/group-hub';

export const Route = createFileRoute('/_app/groups_/$groupId_/memberships/$membershipId')({
  component: GroupMembershipScreen,
});
