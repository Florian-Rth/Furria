import { KkFactRow } from '@furria/ui/KkFactRow';
import type { FC } from 'react';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import type { TicketRequestGroup } from '../ticket-requests-labels';
import { toRequestsTally } from '../ticket-requests-labels';

interface TicketRequestEventRowProps {
  group: TicketRequestGroup;
}

export const TicketRequestEventRow: FC<TicketRequestEventRowProps> = ({ group }) => {
  const span = toDayNumberLabel(group.eventStartsAt);
  const spanLabel = toWeekdayEyebrow(group.eventStartsAt);
  const meta = toRequestsTally(group.requests);

  return (
    <KkFactRow title={group.eventTitle} span={span} spanLabel={spanLabel} meta={meta} tone="gold" />
  );
};
