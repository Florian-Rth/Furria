import type { KkCalendarHeadUnder } from '@furria/ui/calendar-sticky';
import { KkCalendarAgenda } from '@furria/ui/KkCalendarAgenda';
import type { FC } from 'react';
import type { CalendarDayItem } from '../calendar-agenda';
import { toGapView } from '../calendar-agenda-view';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import { CalendarDay } from './CalendarDay';

interface CalendarItemProps {
  item: CalendarDayItem;
  board: CalendarBoard;
  under: KkCalendarHeadUnder;
  orders: ReadonlyMap<string, number>;
  selectedId: number | null;
}

export const CalendarItem: FC<CalendarItemProps> = ({ item, board, under, orders, selectedId }) => {
  if (item.kind === 'gap') {
    const gap = toGapView(item);

    return <KkCalendarAgenda.Gap label={gap.label} anchor={item.key} days={gap.days} />;
  }

  return (
    <CalendarDay item={item} board={board} under={under} orders={orders} selectedId={selectedId} />
  );
};
