import { KkAgenda } from '@furria/ui/KkAgenda';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { AgendaEvening } from '../act-agenda';
import { toDay, toEveningLine, toLongDate, toMarkLabel, toWeekday } from '../agenda-copy';
import { eveningPathOf } from '../agenda-paths';

interface AgendaEveningRowProps {
  evening: AgendaEvening;
  order: number;
  current: boolean;
  showsDate: boolean;
}

export const AgendaEveningRow: FC<AgendaEveningRowProps> = ({
  evening,
  order,
  current,
  showsDate,
}) => {
  const weekday = toWeekday(evening.startsAt);
  const day = toDay(evening.startsAt);
  const dateLabel = toLongDate(evening.startsAt);
  const mark = current ? 'current' : 'none';
  const markLabel = toMarkLabel(current, false);
  const line = toEveningLine(evening);
  const tone = evening.position === null ? 'quiet' : 'plain';
  const to = eveningPathOf(evening.eventId);

  return (
    <KkAgenda.Row
      weekday={weekday}
      day={day}
      dateLabel={dateLabel}
      mark={mark}
      markLabel={markLabel}
      order={order}
      showsDate={showsDate}
    >
      <KkAgenda.Fact title={evening.title} line={line} tone={tone} component={Link} to={to} />
    </KkAgenda.Row>
  );
};
