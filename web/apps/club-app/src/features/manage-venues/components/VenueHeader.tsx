import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import { toVenueAddressLine, VENUE_EYEBROW } from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';

interface VenueHeaderProps {
  venue: ManagedVenue;
}

export const VenueHeader: FC<VenueHeaderProps> = ({ venue }) => {
  const addressLine = toVenueAddressLine(venue);
  const meta =
    addressLine === null ? null : (
      <KkScreenHeader.Meta>
        <KkMeta>{addressLine}</KkMeta>
      </KkScreenHeader.Meta>
    );

  return (
    <KkScreenHeader>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{VENUE_EYEBROW}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{venue.name}</KkScreenHeader.Title>
        {meta}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
