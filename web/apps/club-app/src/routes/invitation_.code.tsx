import { createFileRoute } from '@tanstack/react-router';
import { CodeEntryScreen } from '@/features/redeem';
import { AppFailure } from '@/features/session';

export const Route = createFileRoute('/invitation_/code')({
  component: CodeEntryScreen,
  errorComponent: AppFailure,
});
