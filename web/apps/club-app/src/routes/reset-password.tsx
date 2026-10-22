import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ResetPasswordScreen } from '@/features/password-reset/components/ResetPasswordScreen';
import { AppFailure } from '@/features/session/components/AppFailure';
import { useLinkArrival } from '@/lib/use-link-arrival';

const ResetPasswordRoute: FC = () => {
  const arrival = useLinkArrival();

  return <ResetPasswordScreen key={arrival} />;
};

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordRoute,
  errorComponent: AppFailure,
});
