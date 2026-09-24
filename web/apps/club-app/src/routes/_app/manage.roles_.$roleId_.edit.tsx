import { createFileRoute } from '@tanstack/react-router';
import { RoleEditScreen } from '@/features/manage-roles';

export const Route = createFileRoute('/_app/manage/roles_/$roleId_/edit')({
  component: RoleEditScreen,
});
