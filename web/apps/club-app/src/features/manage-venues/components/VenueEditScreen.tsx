import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isForbiddenError } from '@/lib/query-error';
import { useManagedVenuesQuery } from '../api';
import { findManagedVenue, toVenueId, VENUES_ORIGIN } from '../manage-venues-labels';
import { toManagedVenuesErrorMessage } from '../manage-venues-messages';
import { VenueEditor } from './VenueEditor';
import { VenueEditorDenied } from './VenueEditorDenied';
import { VenueEditorError } from './VenueEditorError';
import { VenueEditorNotFound } from './VenueEditorNotFound';
import { VenueEditorSkeleton } from './VenueEditorSkeleton';

const ROUTE_ID = '/_app/manage/venues_/$venueId_/edit';
const TITLE = 'Ort bearbeiten';

export const VenueEditScreen: FC = () => {
  const { venueId } = useParams({ from: ROUTE_ID });
  const id = toVenueId(venueId);
  const venues = useManagedVenuesQuery();
  const permissions = usePermissions();
  const errorMessage = toManagedVenuesErrorMessage(venues.error);

  const reload = (): void => {
    void venues.refetch();
  };

  if (venues.data === undefined) {
    if (isForbiddenError(venues.error)) {
      return <VenueEditorDenied title={TITLE} origin={VENUES_ORIGIN} />;
    }
    if (errorMessage !== null) {
      return <VenueEditorError message={errorMessage} onRetry={reload} />;
    }

    return <VenueEditorSkeleton />;
  }

  const venue = findManagedVenue(venues.data.venues, id);

  if (venue === null || venue.archivedOn !== null) {
    return <VenueEditorNotFound />;
  }

  const origin = {
    label: venue.name,
    to: '/manage/venues/$venueId',
    params: { venueId: String(venue.venueId) },
  };

  if (!permissions.isUndecided && !permissions.has(PERMISSION_KEYS.clubManage)) {
    return <VenueEditorDenied title={TITLE} origin={origin} />;
  }

  return <VenueEditor venue={venue} />;
};
