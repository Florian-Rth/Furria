import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordScreen } from '@/features/password-reset';
import { AppFailure } from '@/features/session';

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordScreen,
  errorComponent: AppFailure,
});
