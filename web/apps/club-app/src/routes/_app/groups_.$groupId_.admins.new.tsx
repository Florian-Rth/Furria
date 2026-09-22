import { createFileRoute } from '@tanstack/react-router';
import { GroupAdminNewScreen, GroupEntryPrefillSearchSchema } from '@/features/group-hub';

export const Route = createFileRoute('/_app/groups_/$groupId_/admins/new')({
  component: GroupAdminNewScreen,
  validateSearch: GroupEntryPrefillSearchSchema,
});
