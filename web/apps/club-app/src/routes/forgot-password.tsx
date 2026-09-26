import { createFileRoute } from '@tanstack/react-router';
import { ForgotPasswordScreen } from '@/features/password-reset';
import { AppFailure } from '@/features/session';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordScreen,
  errorComponent: AppFailure,
});
