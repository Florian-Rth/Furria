import { createFileRoute } from '@tanstack/react-router';
import { RolesPage } from '@/features/manage-roles/components/RolesPage';
import { RolesSearchSchema } from '@/features/manage-roles/schemas';

export const Route = createFileRoute('/_app/manage/roles')({
  validateSearch: RolesSearchSchema,
  component: RolesPage,
});
