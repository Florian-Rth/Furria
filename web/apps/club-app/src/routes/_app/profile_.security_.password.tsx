import { createFileRoute } from '@tanstack/react-router';
import { PasswordEditScreen } from '@/features/account-security';

export const Route = createFileRoute('/_app/profile_/security_/password')({
  component: PasswordEditScreen,
});
