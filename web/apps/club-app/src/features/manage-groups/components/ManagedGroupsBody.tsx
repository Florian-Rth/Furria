import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useManagedGroupsQuery } from '../api';
import type { ManagedGroupsListing } from '../hooks/use-managed-groups-listing';
import { toManagedGroupsErrorMessage } from '../manage-groups-messages';
import { ManagedGroupsError } from './ManagedGroupsError';
import { ManagedGroupsView } from './ManagedGroupsView';

const LOADING_LABEL = 'Die Gruppenverwaltung wird geladen';

interface ManagedGroupsBodyProps {
  listing: ManagedGroupsListing;
}

export const ManagedGroupsBody: FC<ManagedGroupsBodyProps> = ({ listing }) => {
  const groups = useManagedGroupsQuery();
  const errorMessage = toManagedGroupsErrorMessage(groups.error);

  const reload = (): void => {
    void groups.refetch();
  };

  if (groups.data !== undefined) {
    return <ManagedGroupsView kinds={groups.data.kinds} listing={listing} />;
  }
  if (errorMessage !== null) {
    return <ManagedGroupsError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
