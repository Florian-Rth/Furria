import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useLanding } from '@/features/write/hooks/use-landing';
import { toLandingKey } from '@/features/write/landing-target';
import { toOpeningHoursText, toVenueAddressLine } from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { VenueRecord } from './VenueRecord';

const VENUE_ROUTE = '/manage/venues/$venueId';

interface ManagedVenueCardProps {
  venue: ManagedVenue;
}

export const ManagedVenueCard: FC<ManagedVenueCardProps> = ({ venue }) => {
  const { highlightedKey } = useLanding();
  const landingKey = toLandingKey('venue', venue.venueId);
  const openingHours = toOpeningHoursText(venue.openingHours);

  return (
    <VenueRecord
      name={venue.name}
      addressLine={toVenueAddressLine(venue)}
      hint={venue.hint}
      openingHours={openingHours}
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
