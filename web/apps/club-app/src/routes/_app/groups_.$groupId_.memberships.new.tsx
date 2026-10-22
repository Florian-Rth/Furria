import { createFileRoute } from '@tanstack/react-router';
import { GroupMembershipNewScreen } from '@/features/group-hub/components/GroupMembershipNewScreen';
import { GroupEntryPrefillSearchSchema } from '@/features/group-hub/schemas';

export const Route = createFileRoute('/_app/groups_/$groupId_/memberships/new')({
  component: GroupMembershipNewScreen,
  validateSearch: GroupEntryPrefillSearchSchema,
});
