import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { RedeemScreen } from '@/features/redeem';
import { AppFailure } from '@/features/session';
import { useLinkArrival } from '@/lib/use-link-arrival';

const InvitationRoute: FC = () => {
  const arrival = useLinkArrival();

  return <RedeemScreen key={arrival} />;
};

export const Route = createFileRoute('/invitation')({
  component: InvitationRoute,
  errorComponent: AppFailure,
});
