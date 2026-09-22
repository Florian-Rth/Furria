import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedVenuesQuery } from '../api';
import { findManagedVenue, toVenueId } from '../manage-venues-labels';
import { VenueEditor } from './VenueEditor';
import { VenueEditorDenied } from './VenueEditorDenied';
import { VenueEditorNotFound } from './VenueEditorNotFound';
import { VenueEditorSkeleton } from './VenueEditorSkeleton';

const ROUTE_ID = '/_app/manage/venues_/$venueId_/edit';
const TITLE = 'Ort bearbeiten';

export const VenueEditScreen: FC = () => {
  const { venueId } = useParams({ from: ROUTE_ID });
  const id = toVenueId(venueId);
  const venues = useManagedVenuesQuery();
  const permissions = usePermissions();

  if (venues.data === undefined) {
    return venues.isLoading ? <VenueEditorSkeleton /> : <VenueEditorNotFound />;
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
