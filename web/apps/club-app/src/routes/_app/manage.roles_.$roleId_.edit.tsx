import { createFileRoute } from '@tanstack/react-router';
import { RoleEditScreen } from '@/features/manage-roles/components/RoleEditScreen';
import { RoleEditSearchSchema } from '@/features/manage-roles/schemas';

export const Route = createFileRoute('/_app/manage/roles_/$roleId_/edit')({
  validateSearch: RoleEditSearchSchema,
  component: RoleEditScreen,
});
