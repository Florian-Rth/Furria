import { KkRadioGroup } from '@furria/ui';
import type { FC } from 'react';
import { TICKET_AVAILABILITY_KEYS, TICKET_AVAILABILITY_LABELS } from '@/lib/event-copy';
import { useTicketAvailability } from '../hooks/use-ticket-availability';
import type { EventDetails } from '../schemas';

const GROUP_LABEL = 'Kartenlage';
const GROUP_NAME = 'ticketAvailability';
const AVAILABILITY_OPTIONS = TICKET_AVAILABILITY_KEYS.map((key) => ({
  value: key,
  label: TICKET_AVAILABILITY_LABELS[key],
}));

interface EventAvailabilityChoiceProps {
  event: EventDetails;
}

export const EventAvailabilityChoice: FC<EventAvailabilityChoiceProps> = ({ event }) => {
  const availability = useTicketAvailability(event);

  const options = AVAILABILITY_OPTIONS.map((option) => (
    <KkRadioGroup.Option
      key={option.value}
      value={option.value}
      label={option.label}
      disabled={availability.isSaving}
    />
  ));

  return (
    <KkRadioGroup
      name={GROUP_NAME}
      label={GROUP_LABEL}
      value={availability.value}
      onChange={availability.choose}
    >
      {options}
    </KkRadioGroup>
  );
};
