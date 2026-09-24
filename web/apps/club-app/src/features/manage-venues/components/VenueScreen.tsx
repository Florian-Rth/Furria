import { KkEmptyState, KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AccessDenied, AppSkeletonRegion, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isForbiddenError } from '@/lib/query-error';
import { useManagedVenuesQuery } from '../api';
import {
  findManagedVenue,
  toVenueId,
  VENUE_EDITOR_DENIED_MESSAGE,
  VENUE_NOT_FOUND_DESCRIPTION,
  VENUE_NOT_FOUND_TITLE,
  VENUES_ORIGIN,
} from '../manage-venues-labels';
import { toManagedVenuesErrorMessage } from '../manage-venues-messages';
import { ManagedVenuesError } from './ManagedVenuesError';
import { VenueDetailPanel } from './VenueDetailPanel';

const ROUTE_ID = '/_app/manage/venues_/$venueId';
const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;

export const VenueScreen: FC = () => {
  const { venueId } = useParams({ from: ROUTE_ID });
  const id = toVenueId(venueId);
  const venues = useManagedVenuesQuery();
  const permissions = usePermissions();
  const errorMessage = toManagedVenuesErrorMessage(venues.error);

  const reload = (): void => {
    void venues.refetch();
  };

  if (venues.data === undefined && isForbiddenError(venues.error)) {
    return (
      <KkScreen kind="detail" title={VENUES_ORIGIN.label} origin={VENUES_ORIGIN}>
        <AccessDenied message={VENUE_EDITOR_DENIED_MESSAGE} />
      </KkScreen>
    );
  }
  if (venues.data === undefined && errorMessage !== null) {
    return (
      <KkScreen kind="detail" title={VENUES_ORIGIN.label} origin={VENUES_ORIGIN}>
        <ManagedVenuesError message={errorMessage} onRetry={reload} />
      </KkScreen>
    );
  }
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
