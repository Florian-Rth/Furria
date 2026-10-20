import { KkCheckLine, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toEventStatusLabel } from '@/lib/event-copy';
import { toPriceValue } from '../event-pane-copy';
import { AVAILABILITY_NOTES, toAvailabilityState, toPresaleLine } from '../events-labels';
import { useEventsWorkbench } from '../hooks/use-events-workbench';
import type { EventDetails } from '../schemas';
import { EventAvailabilityChoice } from './EventAvailabilityChoice';
import { EventRequestsPanel } from './EventRequestsPanel';

const PRICE_LABEL = 'Preis';
const PRESALE_LABEL = 'Vorverkauf';
const SALES_LABEL = 'Website zeigt';

interface EventPaneTicketsProps {
  event: EventDetails;
}

export const EventPaneTickets: FC<EventPaneTicketsProps> = ({ event }) => {
  const { handlesRequests } = useEventsWorkbench();
  const priceState = event.priceCents === null ? 'open' : 'done';
  const presaleState = event.presaleStartsAt === null ? 'open' : 'done';
  const availabilityState = toAvailabilityState(event);
  const availability =
    availabilityState === 'settable' ? (
      <EventAvailabilityChoice event={event} />
    ) : (
      <KkNote>{AVAILABILITY_NOTES[availabilityState]}</KkNote>
    );
  const requests = handlesRequests ? <EventRequestsPanel eventId={event.eventId} /> : null;
  const price = toPriceValue(event.priceCents);
  const presale = toPresaleLine(event.presaleStartsAt);
  const sales = toEventStatusLabel(event);

  return (
    <>
      <Stack>
        <KkCheckLine label={PRICE_LABEL} value={price} state={priceState} icon="fees" />
        <KkCheckLine label={PRESALE_LABEL} value={presale} state={presaleState} icon="calendar" />
        <KkCheckLine label={SALES_LABEL} value={sales} state="done" icon="storefront" />
      </Stack>
      {availability}
      {requests}
    </>
  );
};
