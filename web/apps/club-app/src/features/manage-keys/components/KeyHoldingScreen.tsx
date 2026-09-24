import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isForbiddenError } from '@/lib/query-error';
import { useManagedKeysQuery } from '../api';
import {
  findKeyHolding,
  KEYS_ORIGIN,
  toKeyEditorOrigin,
  toKeyHoldingIdParam,
} from '../manage-keys-labels';
import { toManagedKeysErrorMessage } from '../manage-keys-messages';
import { KeyEditorDenied } from './KeyEditorDenied';
import { KeyEditorError } from './KeyEditorError';
import { KeyEditorNotFound } from './KeyEditorNotFound';
import { KeyEditorSkeleton } from './KeyEditorSkeleton';
import { KeyHoldingEditor } from './KeyHoldingEditor';

const ROUTE_ID = '/_app/manage/keys_/holdings/$keyHoldingId';
const TITLE = 'Schlüssel zurücknehmen';

export const KeyHoldingScreen: FC = () => {
  const { keyHoldingId } = useParams({ from: ROUTE_ID });
  const permissions = usePermissions();
  const keys = useManagedKeysQuery();
  const errorMessage = toManagedKeysErrorMessage(keys.error);

  const reload = (): void => {
    void keys.refetch();
  };

  if (keys.data === undefined) {
    if (isForbiddenError(keys.error)) {
      return <KeyEditorDenied title={TITLE} origin={KEYS_ORIGIN} />;
    }
    if (errorMessage !== null) {
      return <KeyEditorError message={errorMessage} onRetry={reload} />;
    }

    return <KeyEditorSkeleton />;
  }

  const id = toKeyHoldingIdParam(keyHoldingId);
  const target = id === null ? null : findKeyHolding(keys.data.venues, id);

  if (target === null) {
    return <KeyEditorNotFound />;
  }
  if (!permissions.isUndecided && !permissions.has(PERMISSION_KEYS.keyHoldingsManage)) {
    return <KeyEditorDenied title={TITLE} origin={toKeyEditorOrigin(target.venue.name)} />;
  }

  return <KeyHoldingEditor venue={target.venue} holding={target.holding} />;
};
