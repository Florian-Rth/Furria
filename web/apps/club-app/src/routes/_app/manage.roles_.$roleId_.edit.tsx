import { createFileRoute } from '@tanstack/react-router';
import { RoleEditScreen, RoleEditSearchSchema } from '@/features/manage-roles';

export const Route = createFileRoute('/_app/manage/roles_/$roleId_/edit')({
  validateSearch: RoleEditSearchSchema,
  component: RoleEditScreen,
});
