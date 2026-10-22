import { createFileRoute } from '@tanstack/react-router';
import { GroupMembershipScreen } from '@/features/group-hub/components/GroupMembershipScreen';

export const Route = createFileRoute('/_app/groups_/$groupId_/memberships/$membershipId')({
  component: GroupMembershipScreen,
});
