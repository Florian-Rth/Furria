import { createFileRoute } from '@tanstack/react-router';
import { GroupEntryPrefillSearchSchema, GroupMembershipNewScreen } from '@/features/group-hub';

export const Route = createFileRoute('/_app/groups_/$groupId_/memberships/new')({
  component: GroupMembershipNewScreen,
  validateSearch: GroupEntryPrefillSearchSchema,
});
