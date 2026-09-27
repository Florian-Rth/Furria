import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ResetPasswordScreen } from '@/features/password-reset';
import { AppFailure } from '@/features/session';
import { useLinkArrival } from '@/lib/use-link-arrival';

const ResetPasswordRoute: FC = () => {
  const arrival = useLinkArrival();

  return <ResetPasswordScreen key={arrival} />;
};

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordRoute,
  errorComponent: AppFailure,
});
