import { createFileRoute } from '@tanstack/react-router';
import { ClaimWindowScreen } from '@/features/claim-window/components/ClaimWindowScreen';
import { AppFailure } from '@/features/session/components/AppFailure';

export const Route = createFileRoute('/claim-window')({
  component: ClaimWindowScreen,
  errorComponent: AppFailure,
});
