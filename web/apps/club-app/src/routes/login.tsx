import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';
import { EXPIRED_FLAG, LoginScreen, LoginSearchSchema } from '@/features/login';
import { AppFailure, useAuthenticatedRedirect } from '@/features/session';
import { getSessionSnapshot } from '@/lib/api/session/session-store';
import { sanitizeReturnTo } from '@/lib/return-to';

const LoginComponent: FC = () => {
  const { returnTo, expired } = Route.useSearch();
  const isRedirecting = useAuthenticatedRedirect(sanitizeReturnTo(returnTo));
  const isExpired = expired === EXPIRED_FLAG;

  if (isRedirecting) {
    return null;
  }

  return <LoginScreen expired={isExpired} />;
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
