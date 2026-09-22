import { createFileRoute } from '@tanstack/react-router';
import { RoleHoldingNewScreen } from '@/features/manage-roles';

export const Route = createFileRoute('/_app/manage/roles_/$roleId_/holdings/new')({
  component: RoleHoldingNewScreen,
});
