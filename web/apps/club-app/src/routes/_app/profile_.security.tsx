import { createFileRoute } from '@tanstack/react-router';
import { AccountSecurityScreen } from '@/features/account-security';

export const Route = createFileRoute('/_app/profile_/security')({
  component: AccountSecurityScreen,
});
