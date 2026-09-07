import { createFileRoute, useRouter } from '@tanstack/react-router';
import type { FC } from 'react';
import { LoginScreen, LoginSearchSchema } from '@/features/login';
import { sanitizeReturnTo } from '@/lib/return-to';

const LoginComponent: FC = () => {
  const { returnTo, expired } = Route.useSearch();
  const router = useRouter();

  const goToReturnTo = (): void => {
    router.history.replace(sanitizeReturnTo(returnTo));
  };

  return <LoginScreen expired={expired} onSignedIn={goToReturnTo} />;
};

export const Route = createFileRoute('/login')({
  validateSearch: LoginSearchSchema,
  component: LoginComponent,
});
