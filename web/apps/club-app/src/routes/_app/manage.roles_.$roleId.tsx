import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/features/manage-roles/components/RolePage';

export const Route = createFileRoute('/_app/manage/roles_/$roleId')({
  component: RolePage,
});
