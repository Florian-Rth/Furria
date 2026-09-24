import { createFileRoute } from '@tanstack/react-router';
import { RoleHoldingScreen } from '@/features/manage-roles';

export const Route = createFileRoute('/_app/manage/roles_/$roleId_/holdings/$roleHoldingId')({
  component: RoleHoldingScreen,
});
