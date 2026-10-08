import type { KkPanelAction } from '@furria/ui';
import { KkFieldRow, KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  AVAILABILITY_NOTES,
  EVENT_SECTION_TITLES,
  toAvailabilityState,
  toPresaleLine,
  toPriceLabel,
} from '../events-labels';
import type { EventDetails } from '../schemas';
import { EventAvailabilityChoice } from './EventAvailabilityChoice';

const EDIT_LABEL = 'Bearbeiten';
const EDIT_ACTION_LABEL = 'Preis und Vorverkauf bearbeiten';
const PRICE_LABEL = 'Preis';
const PRESALE_LABEL = 'Vorverkauf';
const MISSING_PRICE = 'noch offen';

interface EventTicketsPanelProps {
  event: EventDetails;
}

export const EventTicketsPanel: FC<EventTicketsPanelProps> = ({ event }) => {
  const priceLabel = toPriceLabel(event.priceCents) ?? MISSING_PRICE;
  const presaleLine = toPresaleLine(event.presaleStartsAt);
  const availabilityState = toAvailabilityState(event);

  const availability =
    availabilityState === 'settable' ? (
      <EventAvailabilityChoice event={event} />
    ) : (
      <KkNote>{AVAILABILITY_NOTES[availabilityState]}</KkNote>
    );

  const action: KkPanelAction = {
    label: EDIT_LABEL,
    icon: 'edit',
    ariaLabel: EDIT_ACTION_LABEL,
    component: Link,
    to: '/events/$eventId/edit',
    params: { eventId: String(event.eventId) },
  };

  return (
    <KkPanelSection title={EVENT_SECTION_TITLES.tickets} action={action}>
      <KkPanel>
        <KkFieldRow label={PRICE_LABEL} value={priceLabel} />
        <KkFieldRow label={PRESALE_LABEL} value={presaleLine} />
        {availability}
      </KkPanel>
    </KkPanelSection>
  );
};
