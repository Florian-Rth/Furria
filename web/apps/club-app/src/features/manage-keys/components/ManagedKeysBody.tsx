import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useManagedKeysQuery } from '../api';
import { toManagedKeysErrorMessage } from '../manage-keys-messages';
import { ManagedKeysError } from './ManagedKeysError';
import { ManagedKeysView } from './ManagedKeysView';

const LOADING_LABEL = 'Die Schlüssel werden geladen';

export const ManagedKeysBody: FC = () => {
  const keys = useManagedKeysQuery();
  const errorMessage = toManagedKeysErrorMessage(keys.error);

  const reload = (): void => {
    void keys.refetch();
  };

  if (keys.data !== undefined) {
    return <ManagedKeysView venues={keys.data.venues} />;
  }
  if (errorMessage !== null) {
    return <ManagedKeysError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
