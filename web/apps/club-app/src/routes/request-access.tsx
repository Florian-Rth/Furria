import { createFileRoute } from '@tanstack/react-router';
import { RequestAccessScreen } from '@/features/request-access';
import { AppFailure } from '@/features/session';

export const Route = createFileRoute('/request-access')({
  component: RequestAccessScreen,
  errorComponent: AppFailure,
});
