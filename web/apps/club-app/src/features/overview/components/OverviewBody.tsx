import type { FC } from 'react';
import { useMeQuery } from '@/features/session';
import { toOverviewErrorMessage } from '../overview-messages';
import { OverviewCards } from './OverviewCards';
import { OverviewError } from './OverviewError';
import { OverviewSkeleton } from './OverviewSkeleton';

export const OverviewBody: FC = () => {
  const me = useMeQuery();
  const errorMessage = toOverviewErrorMessage(me.error);

  const reload = (): void => {
    void me.refetch();
  };

  if (me.data !== undefined) {
    return <OverviewCards me={me.data} />;
  }
  if (errorMessage !== null) {
    return <OverviewError message={errorMessage} onRetry={reload} />;
  }

  return <OverviewSkeleton />;
};
