import { KkDensePanel } from '@furria/ui';
import type { FC } from 'react';
import { useCalendarPanel } from '../hooks/use-calendar-panel';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartPanelOf } from '../start-board';
import { CalendarLine } from './CalendarLine';

const HEAD_ID = 'start-calendar-head';
const LABEL = 'KALENDER';

interface CalendarPanelProps {
  panel: StartPanelOf<'calendar'>;
  board: StartBoard;
}

export const CalendarPanel: FC<CalendarPanelProps> = ({ panel, board }) => {
  const { rows, toggle, collapse, foot } = useCalendarPanel(panel, board.dimmedKeys);

  const lines = rows.map((row) => (
    <CalendarLine
      key={row.entry.calendarEntryId}
      entry={row.entry}
      previousStartsAt={row.previousStartsAt}
      now={board.now}
      dimmed={row.dimmed}
      expanded={row.expanded}
      onToggle={toggle}
      onCollapse={collapse}
      onTouch={board.touch}
    />
  ));

  const footLine =
    foot === null ? null : <KkDensePanel.Foot label={foot.label} onClick={foot.open} />;

  return (
    <KkDensePanel material="own" labelledBy={HEAD_ID}>
      <KkDensePanel.Head id={HEAD_ID} label={LABEL} />
      <KkDensePanel.Lines>{lines}</KkDensePanel.Lines>
      {footLine}
    </KkDensePanel>
  );
};
