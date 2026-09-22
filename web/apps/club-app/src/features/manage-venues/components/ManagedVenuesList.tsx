import type { KkPanelAction } from '@furria/ui';
import { KkButton, KkEmptyState, KkIcon, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  MANAGE_VENUES_CREATE_LABEL,
  MANAGED_VENUES_EMPTY,
  VENUE_SECTION_TITLES,
} from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { ManagedVenueCard } from './ManagedVenueCard';

const CREATE_ROUTE = '/manage/venues/new';
const CREATE_PILL_LABEL = 'Ort';
const LIST_GAP = 1.5;

interface ManagedVenuesListProps {
  venues: readonly ManagedVenue[];
}

export const ManagedVenuesList: FC<ManagedVenuesListProps> = ({ venues }) => {
  const action: KkPanelAction = {
    label: CREATE_PILL_LABEL,
    icon: 'add',
    ariaLabel: MANAGE_VENUES_CREATE_LABEL,
    component: Link,
    to: CREATE_ROUTE,
  };

  if (venues.length === 0) {
    return (
      <KkPanelSection title={VENUE_SECTION_TITLES.running} action={action}>
        <KkEmptyState
          title={MANAGED_VENUES_EMPTY.title}
          description={MANAGED_VENUES_EMPTY.description}
          action={
            <KkButton
              startIcon={<KkIcon name="add" size="small" />}
              component={Link}
              to={CREATE_ROUTE}
            >
              {MANAGE_VENUES_CREATE_LABEL}
            </KkButton>
          }
        />
      </KkPanelSection>
    );
  }

  return (
    <KkPanelSection title={VENUE_SECTION_TITLES.running} action={action}>
      <Stack sx={{ gap: LIST_GAP, minWidth: 0 }}>
        {venues.map((venue) => (
          <ManagedVenueCard key={venue.venueId} venue={venue} />
        ))}
      </Stack>
    </KkPanelSection>
  );
};
