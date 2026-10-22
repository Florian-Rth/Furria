import { createFileRoute } from '@tanstack/react-router';
import { RoleNewScreen } from '@/features/manage-roles/components/RoleNewScreen';

export const Route = createFileRoute('/_app/manage/roles_/new')({
  component: RoleNewScreen,
});
