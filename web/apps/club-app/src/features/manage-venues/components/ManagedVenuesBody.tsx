import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useManagedVenuesQuery } from '../api';
import { toManagedVenuesErrorMessage } from '../manage-venues-messages';
import { ManagedVenuesError } from './ManagedVenuesError';
import { ManagedVenuesView } from './ManagedVenuesView';

const LOADING_LABEL = 'Die Orte werden geladen';

interface ManagedVenuesBodyProps {
  onCreate: () => void;
}

export const ManagedVenuesBody: FC<ManagedVenuesBodyProps> = ({ onCreate }) => {
  const venues = useManagedVenuesQuery();
  const errorMessage = toManagedVenuesErrorMessage(venues.error);

  const reload = (): void => {
    void venues.refetch();
  };

  if (venues.data !== undefined) {
    return <ManagedVenuesView venues={venues.data.venues} onCreate={onCreate} />;
  }
  if (errorMessage !== null) {
    return <ManagedVenuesError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
