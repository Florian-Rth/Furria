import { KkCheckLine } from '@furria/ui/KkCheckLine';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toEventStatusLabel } from '@/lib/event-copy';
import { ARCHIVED_PLACES_NOTE, toPresalePlacesValue, toPriceValue } from '../event-pane-copy';
import { AVAILABILITY_NOTES, toAvailabilityState, toPresaleLine } from '../events-labels';
import type { EventDetails } from '../schemas';
import { EventAvailabilityChoice } from './EventAvailabilityChoice';

const PRICE_LABEL = 'Preis';
const PRESALE_LABEL = 'Vorverkauf';
const PLACES_LABEL = 'Vorverkaufsstellen';
const SALES_LABEL = 'Website zeigt';
const PLACES_MAX_LINES = 3;

interface EventPaneTicketsProps {
  event: EventDetails;
}

export const EventPaneTickets: FC<EventPaneTicketsProps> = ({ event }) => {
  const priceState = event.priceCents === null ? 'open' : 'done';
  const presaleState = event.presaleStartsAt === null ? 'open' : 'done';
  const hasArchivedPlace = event.presalePlaces.some((place) => place.isArchived);
  const placesState = event.presalePlaces.length === 0 || hasArchivedPlace ? 'open' : 'done';
  const availabilityState = toAvailabilityState(event);
  const availability =
    availabilityState === 'settable' ? (
      <EventAvailabilityChoice event={event} />
    ) : (
      <KkNote>{AVAILABILITY_NOTES[availabilityState]}</KkNote>
    );
  const archivedNote = hasArchivedPlace ? <KkNote>{ARCHIVED_PLACES_NOTE}</KkNote> : null;
  const price = toPriceValue(event.priceCents);
  const presale = toPresaleLine(event.presaleStartsAt);
  const places = toPresalePlacesValue(event.presalePlaces);
  const sales = toEventStatusLabel(event);

  return (
    <>
      <Stack>
        <KkCheckLine label={PRICE_LABEL} value={price} state={priceState} icon="fees" />
        <KkCheckLine label={PRESALE_LABEL} value={presale} state={presaleState} icon="calendar" />
        <KkCheckLine
          label={PLACES_LABEL}
          value={places}
          state={placesState}
          icon="place"
          lines={PLACES_MAX_LINES}
        />
        <KkCheckLine label={SALES_LABEL} value={sales} state="done" icon="storefront" />
      </Stack>
      {archivedNote}
      {availability}
    </>
  );
};
