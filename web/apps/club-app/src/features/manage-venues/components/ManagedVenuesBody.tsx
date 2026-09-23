import type { FC } from 'react';
import { AccessDenied, AppListSkeleton } from '@/features/session';
import { isForbiddenError } from '@/lib/query-error';
import { useManagedVenuesQuery } from '../api';
import { VENUE_EDITOR_DENIED_MESSAGE } from '../manage-venues-labels';
import { toManagedVenuesErrorMessage } from '../manage-venues-messages';
import { ManagedVenuesError } from './ManagedVenuesError';
import { ManagedVenuesView } from './ManagedVenuesView';

const LOADING_LABEL = 'Die Orte werden geladen';

export const ManagedVenuesBody: FC = () => {
  const venues = useManagedVenuesQuery();
  const errorMessage = toManagedVenuesErrorMessage(venues.error);

  const reload = (): void => {
    void venues.refetch();
  };

  if (venues.data !== undefined) {
    return <ManagedVenuesView venues={venues.data.venues} />;
  }
  if (isForbiddenError(venues.error)) {
    return <AccessDenied message={VENUE_EDITOR_DENIED_MESSAGE} />;
  }
  if (errorMessage !== null) {
    return <ManagedVenuesError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
