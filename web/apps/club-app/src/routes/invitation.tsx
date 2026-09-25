import { createFileRoute } from '@tanstack/react-router';
import { RedeemScreen } from '@/features/redeem';
import { AppFailure } from '@/features/session';

export const Route = createFileRoute('/invitation')({
  component: RedeemScreen,
  errorComponent: AppFailure,
});
