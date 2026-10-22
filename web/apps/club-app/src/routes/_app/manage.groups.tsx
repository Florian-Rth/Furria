import { createFileRoute } from '@tanstack/react-router';
import { ManagedGroupsPage } from '@/features/manage-groups/components/ManagedGroupsPage';
import { ManagedGroupsSearchSchema } from '@/features/manage-groups/schemas';

export const Route = createFileRoute('/_app/manage/groups')({
  component: ManagedGroupsPage,
  validateSearch: ManagedGroupsSearchSchema,
});
