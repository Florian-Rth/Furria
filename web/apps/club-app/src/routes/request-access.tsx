import { createFileRoute } from '@tanstack/react-router';
import { RequestAccessScreen } from '@/features/request-access/components/RequestAccessScreen';
import { AppFailure } from '@/features/session/components/AppFailure';

export const Route = createFileRoute('/request-access')({
  component: RequestAccessScreen,
  errorComponent: AppFailure,
});
