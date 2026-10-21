import type { KkCalendarHeadUnder } from '@furria/ui';
import { KkCalendarAgenda, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import type { CalendarSection as CalendarSectionData } from '../calendar-agenda';
import { toSectionView } from '../calendar-agenda-view';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import { CalendarItem } from './CalendarItem';

interface CalendarSectionProps {
  section: CalendarSectionData;
  board: CalendarBoard;
  under: KkCalendarHeadUnder;
  orders: ReadonlyMap<string, number>;
  selectedId: number | null;
}

export const CalendarSection: FC<CalendarSectionProps> = ({
  section,
  board,
  under,
  orders,
  selectedId,
}) => {
  const view = toSectionView(section, board.todayDay);
  const items = section.items.map((item) => (
    <CalendarItem
      key={item.key}
      item={item}
      board={board}
      under={under}
      orders={orders}
      selectedId={selectedId}
    />
  ));

  return (
    <KkPanelSection title={view.title} meta={view.meta}>
      <KkCalendarAgenda.Days>{items}</KkCalendarAgenda.Days>
    </KkPanelSection>
  );
};
