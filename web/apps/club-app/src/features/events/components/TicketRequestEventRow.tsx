import { KkFactRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import type { TicketRequestGroup } from '../ticket-requests-labels';
import { toRequestsTally } from '../ticket-requests-labels';

interface TicketRequestEventRowProps {
  group: TicketRequestGroup;
  linksToEvent: boolean;
}

export const TicketRequestEventRow: FC<TicketRequestEventRowProps> = ({ group, linksToEvent }) => {
  const span = toDayNumberLabel(group.eventStartsAt);
  const spanLabel = toWeekdayEyebrow(group.eventStartsAt);
  const meta = toRequestsTally(group.requests);
  const params = { eventId: String(group.eventId) };

  return (
    <KkFactRow
      title={group.eventTitle}
      span={span}
      spanLabel={spanLabel}
      meta={meta}
      tone="gold"
      component={linksToEvent ? Link : undefined}
      to={linksToEvent ? '/events/$eventId' : undefined}
      params={linksToEvent ? params : undefined}
    />
  );
};
