import { createFileRoute } from '@tanstack/react-router';
import { RoleNewScreen } from '@/features/manage-roles';

export const Route = createFileRoute('/_app/manage/roles_/new')({
  component: RoleNewScreen,
});
