import { createFileRoute } from '@tanstack/react-router';
import { ForgotPasswordScreen } from '@/features/password-reset/components/ForgotPasswordScreen';
import { AppFailure } from '@/features/session/components/AppFailure';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordScreen,
  errorComponent: AppFailure,
});
