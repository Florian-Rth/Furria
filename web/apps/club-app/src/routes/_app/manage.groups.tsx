import { createFileRoute } from '@tanstack/react-router';
import { ManagedGroupsPage, ManagedGroupsSearchSchema } from '@/features/manage-groups';

export const Route = createFileRoute('/_app/manage/groups')({
  component: ManagedGroupsPage,
  validateSearch: ManagedGroupsSearchSchema,
});
