import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey, useLanding } from '@/features/write';
import { toVenueAddressLine } from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { VenueRecord } from './VenueRecord';

const VENUE_ROUTE = '/manage/venues/$venueId';

interface ManagedVenueCardProps {
  venue: ManagedVenue;
}

export const ManagedVenueCard: FC<ManagedVenueCardProps> = ({ venue }) => {
  const { highlightedKey } = useLanding();
  const landingKey = toLandingKey('venue', venue.venueId);

  return (
    <VenueRecord
      name={venue.name}
      addressLine={toVenueAddressLine(venue)}
      hint={venue.hint}
      note={null}
      dimmed={false}
      component={Link}
      to={VENUE_ROUTE}
      params={{ venueId: String(venue.venueId) }}
      highlight={highlightedKey === landingKey}
      landing={landingKey}
    />
  );
};
