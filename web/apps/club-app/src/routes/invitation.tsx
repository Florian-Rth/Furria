import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { RedeemScreen } from '@/features/redeem/components/RedeemScreen';
import { AppFailure } from '@/features/session/components/AppFailure';
import { useLinkArrival } from '@/lib/use-link-arrival';

const InvitationRoute: FC = () => {
  const arrival = useLinkArrival();

  return <RedeemScreen key={arrival} />;
};

export const Route = createFileRoute('/invitation')({
  component: InvitationRoute,
  errorComponent: AppFailure,
});
