import type { FC } from 'react';
import { AccessDenied, AppListSkeleton } from '@/features/session';
import { isForbiddenError } from '@/lib/query-error';
import { useManagedKeysQuery } from '../api';
import { KEY_EDITOR_DENIED_MESSAGE } from '../manage-keys-labels';
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
  if (isForbiddenError(keys.error)) {
    return <AccessDenied message={KEY_EDITOR_DENIED_MESSAGE} />;
  }
  if (errorMessage !== null) {
    return <ManagedKeysError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
