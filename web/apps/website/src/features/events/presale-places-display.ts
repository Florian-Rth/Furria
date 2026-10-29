import { formatOpeningHours, type OpeningHoursLine } from '@furria/api-client/opening-hours';
import { formatNumericDate } from '@/lib/date';
import type { EventDetail } from '@/lib/public-events/schemas';
import { presalePlacesHeading } from './event-detail-content';
import { deriveVenueAddress } from './event-detail-display';

export interface PresalePlaceView {
  name: string;
  address: string | null;
  hint: string | null;
  openingHours: OpeningHoursLine[];
}

export interface PresalePlacesView {
  opensAt: string | null;
  places: PresalePlaceView[];
}

const CLOCK_UNIT = 'Uhr';

const withClockUnit = (line: OpeningHoursLine): OpeningHoursLine => ({
  days: line.days,
  times: `${line.times} ${CLOCK_UNIT}`,
});

export const derivePresalePlaces = (
  event: Pick<EventDetail, 'status' | 'presaleStartsAt' | 'presalePlaces'>,
): PresalePlacesView | null => {
  if (event.presalePlaces.length === 0) {
    return null;
  }

  const opensAt = event.status === 'presaleScheduled' ? event.presaleStartsAt : null;
  const places = event.presalePlaces.map((place) => {
    const address = deriveVenueAddress(place);
    return {
      name: place.name,
      address: address.length > 0 ? address : null,
      hint: place.hint,
      openingHours: formatOpeningHours(place.openingHours).map(withClockUnit),
    };
  });

  return { opensAt, places };
};

export const presalePlacesHeadingOf = (opensAt: string | null): string =>
  opensAt === null ? presalePlacesHeading : `Ab ${formatNumericDate(opensAt)} bei`;
