import { createFileRoute } from '@tanstack/react-router';
import { LoginEmailEditScreen } from '@/features/account-security';

export const Route = createFileRoute('/_app/profile_/security_/login-email')({
  component: LoginEmailEditScreen,
});
