import { createFileRoute } from '@tanstack/react-router';
import { CodeEntryScreen } from '@/features/redeem/components/CodeEntryScreen';
import { AppFailure } from '@/features/session/components/AppFailure';

export const Route = createFileRoute('/invitation_/code')({
  component: CodeEntryScreen,
  errorComponent: AppFailure,
});
