import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LoginScreen, LoginSearchSchema } from '@/features/login';
import { useAuthenticatedRedirect } from '@/features/session';
import { sanitizeReturnTo } from '@/lib/return-to';

const LoginComponent: FC = () => {
  const { returnTo, expired } = Route.useSearch();
  const isRedirecting = useAuthenticatedRedirect(sanitizeReturnTo(returnTo));

  if (isRedirecting) {
    return null;
  }

  return <LoginScreen expired={expired} />;
};

export const Route = createFileRoute('/login')({
  validateSearch: LoginSearchSchema,
  component: LoginComponent,
});
