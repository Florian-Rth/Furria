import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';
import { LoginScreen } from '@/features/login/components/LoginScreen';
import { EXPIRED_FLAG, LoginSearchSchema, PASSWORD_RESET_FLAG } from '@/features/login/schemas';
import { AppFailure } from '@/features/session/components/AppFailure';
import { useAuthenticatedRedirect } from '@/features/session/hooks/use-authenticated-redirect';
import { getSessionSnapshot } from '@/lib/api/session/session-store';
import { sanitizeReturnTo } from '@/lib/return-to';

const LoginComponent: FC = () => {
  const { returnTo, expired, farewell, passwordReset } = Route.useSearch();
  const isRedirecting = useAuthenticatedRedirect(sanitizeReturnTo(returnTo));
  const isExpired = expired === EXPIRED_FLAG;
  const isPasswordReset = passwordReset === PASSWORD_RESET_FLAG;

  if (isRedirecting) {
    return null;
  }

  return (
    <LoginScreen expired={isExpired} farewell={farewell ?? null} passwordReset={isPasswordReset} />
  );
};

export const Route = createFileRoute('/login')({
  validateSearch: LoginSearchSchema,
  beforeLoad: ({ search }) => {
    if (getSessionSnapshot().status === 'authenticated') {
      throw redirect({ href: sanitizeReturnTo(search.returnTo), replace: true });
    }
  },
  component: LoginComponent,
  errorComponent: AppFailure,
});
