import { KkNote } from '@furria/ui/KkNote';
import { KkNumberedList } from '@furria/ui/KkNumberedList';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { FC } from 'react';
import { RUNNING_ORDER_LIST_LABEL, RUNNING_ORDER_TITLE } from '../evening-running-order-copy';
import { useCalendarRunningOrder } from '../hooks/use-calendar-running-order';
import type { CalendarEntry } from '../schemas';
import { CalendarRunningOrderLine } from './CalendarRunningOrderLine';

const SKELETON_ROWS = 3;

interface CalendarRunningOrderSectionProps {
  entry: CalendarEntry;
}

export const CalendarRunningOrderSection: FC<CalendarRunningOrderSectionProps> = ({ entry }) => {
  const runningOrder = useCalendarRunningOrder(entry);

  switch (runningOrder.state) {
    case 'none':
      return null;
    case 'loading':
      return (
        <KkPanelSection title={RUNNING_ORDER_TITLE}>
          <KkSkeletonRow count={SKELETON_ROWS} />
        </KkPanelSection>
      );
    case 'note':
      return (
        <KkPanelSection title={RUNNING_ORDER_TITLE}>
          <KkNote>{runningOrder.note}</KkNote>
        </KkPanelSection>
      );
    case 'ready': {
      const lines = runningOrder.rows.map((row) => (
        <CalendarRunningOrderLine key={row.key} row={row} />
      ));

      return (
        <KkPanelSection title={RUNNING_ORDER_TITLE}>
          <KkNote>{runningOrder.note}</KkNote>
          <KkNumberedList label={RUNNING_ORDER_LIST_LABEL}>{lines}</KkNumberedList>
        </KkPanelSection>
      );
    }
  }
};
