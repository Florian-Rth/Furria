import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/features/manage-roles';

export const Route = createFileRoute('/_app/manage/roles_/$roleId')({
  component: RolePage,
});
