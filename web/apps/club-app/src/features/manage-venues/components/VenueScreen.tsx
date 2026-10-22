import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkScreenHeaderSkeleton } from '@furria/ui/KkScreenHeaderSkeleton';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS } from '@/features/session/app-sections';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import { isForbiddenError } from '@/lib/query-error';
import { useManagedVenuesQuery } from '../api';
import {
  findManagedVenue,
  VENUE_EDITOR_DENIED_MESSAGE,
  VENUE_NOT_FOUND_DESCRIPTION,
  VENUE_NOT_FOUND_TITLE,
  VENUES_ORIGIN,
} from '../manage-venues-labels';
import { toManagedVenuesErrorMessage } from '../manage-venues-messages';
import { ManagedVenuesError } from './ManagedVenuesError';
import { VenueDetailPanel } from './VenueDetailPanel';
import { VenueHeader } from './VenueHeader';

const ROUTE_ID = '/_app/manage/venues_/$venueId';
const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;
const SKELETON_HEADER = <KkScreenHeaderSkeleton />;
const HANDOVER = AREA_HANDOVERS.manage;

export const VenueScreen: FC = () => {
  const { venueId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(venueId);
  const permissions = usePermissions();
  const canManage = permissions.has(PERMISSION_KEYS.clubManage);
  const venues = useManagedVenuesQuery(canManage);
  const errorMessage = toManagedVenuesErrorMessage(venues.error);
  const isDenied =
    (!permissions.isUndecided && !canManage) ||
    (venues.data === undefined && isForbiddenError(venues.error));

  const reload = (): void => {
    void venues.refetch();
  };

  if (isDenied) {
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
      <KkScreen
        kind="detail"
        title={VENUES_ORIGIN.label}
        origin={VENUES_ORIGIN}
        header={SKELETON_HEADER}
        handover={HANDOVER}
      >
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

  const header = <VenueHeader venue={venue} />;

  return (
    <KkScreen
      kind="detail"
      title={venue.name}
      origin={VENUES_ORIGIN}
      header={header}
      handover={HANDOVER}
    >
      <VenueDetailPanel venue={venue} />
    </KkScreen>
  );
};
