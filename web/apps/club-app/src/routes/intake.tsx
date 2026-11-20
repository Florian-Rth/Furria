import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { IntakeScreen } from '@/features/intake/components/IntakeScreen';
import { AppFailure } from '@/features/session/components/AppFailure';
import { useLinkArrival } from '@/lib/use-link-arrival';

const IntakeRoute: FC = () => {
  const arrival = useLinkArrival();

  return <IntakeScreen key={arrival} />;
};

export const Route = createFileRoute('/intake')({
  component: IntakeRoute,
  errorComponent: AppFailure,
});
