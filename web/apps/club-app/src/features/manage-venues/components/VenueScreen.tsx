import { KkEmptyState, KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AccessDenied, AppSkeletonRegion, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedVenuesQuery } from '../api';
import {
  findManagedVenue,
  toVenueId,
  VENUE_EDITOR_DENIED_MESSAGE,
  VENUE_NOT_FOUND_DESCRIPTION,
  VENUE_NOT_FOUND_TITLE,
  VENUES_ORIGIN,
} from '../manage-venues-labels';
import { VenueDetailPanel } from './VenueDetailPanel';

const ROUTE_ID = '/_app/manage/venues_/$venueId';
const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;

export const VenueScreen: FC = () => {
  const { venueId } = useParams({ from: ROUTE_ID });
  const id = toVenueId(venueId);
  const venues = useManagedVenuesQuery();
  const permissions = usePermissions();

  if (venues.data === undefined) {
    return (
      <KkScreen kind="detail" title={VENUES_ORIGIN.label} origin={VENUES_ORIGIN}>
        <AppSkeletonRegion label={LOADING_LABEL}>
          <KkPanelStack>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={SKELETON_LINES} />
            </KkPanel>
          </KkPanelStack>
        </AppSkeletonRegion>
      </KkScreen>
    );
  }

  const venue = findManagedVenue(venues.data.venues, id);

  if (venue === null || venue.archivedOn !== null) {
    return (
      <KkScreen kind="detail" title={VENUES_ORIGIN.label} origin={VENUES_ORIGIN}>
        <KkEmptyState title={VENUE_NOT_FOUND_TITLE} description={VENUE_NOT_FOUND_DESCRIPTION} />
      </KkScreen>
    );
  }

  if (!permissions.isUndecided && !permissions.has(PERMISSION_KEYS.clubManage)) {
    return (
      <KkScreen kind="detail" title={venue.name} origin={VENUES_ORIGIN}>
        <AccessDenied message={VENUE_EDITOR_DENIED_MESSAGE} />
      </KkScreen>
    );
  }

  return (
    <KkScreen kind="detail" title={venue.name} origin={VENUES_ORIGIN}>
      <VenueDetailPanel venue={venue} />
    </KkScreen>
  );
};
