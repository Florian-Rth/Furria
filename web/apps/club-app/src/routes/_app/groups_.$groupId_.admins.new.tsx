import { createFileRoute } from '@tanstack/react-router';
import { GroupAdminNewScreen } from '@/features/group-hub/components/GroupAdminNewScreen';
import { GroupEntryPrefillSearchSchema } from '@/features/group-hub/schemas';

export const Route = createFileRoute('/_app/groups_/$groupId_/admins/new')({
  component: GroupAdminNewScreen,
  validateSearch: GroupEntryPrefillSearchSchema,
});
