import { KkChip } from '@furria/ui/KkChip';
import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC } from 'react';
import { RUNNING_ORDER_OWN, RUNNING_ORDER_ROW_LABEL } from '../evening-running-order-copy';
import type { CalendarRunningOrderRow } from '../hooks/use-calendar-running-order';

interface CalendarRunningOrderLineProps {
  row: CalendarRunningOrderRow;
}

export const CalendarRunningOrderLine: FC<CalendarRunningOrderLineProps> = ({ row }) => {
  const fact = row.groupName === null ? null : <span>{row.groupName}</span>;
  const chips = row.own ? (
    <KkChip tone="gold" size="small">
      {RUNNING_ORDER_OWN}
    </KkChip>
  ) : null;
  const state = row.own ? 'marked' : 'rest';

  return (
    <KkNumberedList.Row
      rowKey={row.key}
      number={row.number}
      mark={null}
      title={row.title}
      fact={fact}
      chips={chips}
      state={state}
      arrive={false}
      openLabel={RUNNING_ORDER_ROW_LABEL}
    />
  );
};
