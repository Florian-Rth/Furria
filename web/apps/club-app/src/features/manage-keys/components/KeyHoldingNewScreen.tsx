import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedKeysQuery } from '../api';
import { findKeyVenue, toKeyEditorOrigin, toVenueIdParam } from '../manage-keys-labels';
import { KeyEditorDenied } from './KeyEditorDenied';
import { KeyEditorNotFound } from './KeyEditorNotFound';
import { KeyEditorSkeleton } from './KeyEditorSkeleton';
import { KeyHoldingEditor } from './KeyHoldingEditor';

const ROUTE_ID = '/_app/manage/keys_/$venueId_/holdings/new';
const TITLE = 'Schlüssel ausgeben';

export const KeyHoldingNewScreen: FC = () => {
  const { venueId } = useParams({ from: ROUTE_ID });
  const permissions = usePermissions();
  const keys = useManagedKeysQuery();

  if (keys.data === undefined) {
    return keys.isLoading ? <KeyEditorSkeleton /> : <KeyEditorNotFound />;
  }

  const id = toVenueIdParam(venueId);
  const venue = id === null ? null : findKeyVenue(keys.data.venues, id);

  if (venue === null) {
    return <KeyEditorNotFound />;
  }
  if (!permissions.isUndecided && !permissions.has(PERMISSION_KEYS.keyHoldingsManage)) {
    return <KeyEditorDenied title={TITLE} origin={toKeyEditorOrigin(venue.name)} />;
  }

  return <KeyHoldingEditor venue={venue} holding={null} />;
};
