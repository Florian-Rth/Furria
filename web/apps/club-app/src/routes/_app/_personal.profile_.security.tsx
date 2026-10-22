import { createFileRoute } from '@tanstack/react-router';
import { AccountSecurityScreen } from '@/features/account-security/components/AccountSecurityScreen';

export const Route = createFileRoute('/_app/_personal/profile_/security')({
  component: AccountSecurityScreen,
});
