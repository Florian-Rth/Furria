import { createFileRoute } from '@tanstack/react-router';
import { RolesPage, RolesSearchSchema } from '@/features/manage-roles';

export const Route = createFileRoute('/_app/manage/roles')({
  validateSearch: RolesSearchSchema,
  component: RolesPage,
});
