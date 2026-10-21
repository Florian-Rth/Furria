import type { KkCalendarHeadUnder } from '@furria/ui';
import { KkCalendarAgenda } from '@furria/ui';
import type { FC } from 'react';
import type { CalendarDayItem } from '../calendar-agenda';
import { toDayHeadView } from '../calendar-agenda-view';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import { CalendarLine } from './CalendarLine';

interface CalendarDayProps {
  item: Extract<CalendarDayItem, { kind: 'day' }>;
  board: CalendarBoard;
  under: KkCalendarHeadUnder;
  orders: ReadonlyMap<string, number>;
  selectedId: number | null;
}

export const CalendarDay: FC<CalendarDayProps> = ({ item, board, under, orders, selectedId }) => {
  const head = toDayHeadView(item, board.todayDay);
  const lines = item.lines.map((line) => (
    <CalendarLine
      key={line.key}
      line={line}
      nowMs={board.nowMs}
      order={orders.get(line.key) ?? 0}
      selected={line.entry.calendarEntryId === selectedId}
      highlightedKey={board.highlightedKey}
      onSelect={board.select}
    />
  ));
  const panel =
    lines.length === 0 ? null : <KkCalendarAgenda.Panel>{lines}</KkCalendarAgenda.Panel>;

  return (
    <KkCalendarAgenda.Day isoDay={item.isoDay} anchor={item.key} label={head.spoken}>
      <KkCalendarAgenda.DayHead
        date={head.date}
        relative={head.relative}
        tone={head.tone}
        landmark={head.landmark}
        carnival={head.carnival}
        note={head.note}
        under={under}
        highlight={item.isoDay === board.landingDay}
      />
      {panel}
    </KkCalendarAgenda.Day>
  );
};
