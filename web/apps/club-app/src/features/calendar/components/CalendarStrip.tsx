import { KkCalendarStrip } from '@furria/ui';
import type { FC } from 'react';
import {
  CLOSE_HOURS_LABEL,
  COLLAPSE_LABEL,
  EXPAND_LABEL,
  MODE_LABELS,
  MODES_LABEL,
  NEXT_MONTH,
  NEXT_WEEK,
  PREVIOUS_MONTH,
  PREVIOUS_WEEK,
  STRIP_LABEL,
  TODAY,
} from '../calendar-agenda-copy';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import { useCalendarFold } from '../hooks/use-calendar-fold';
import type { CalendarScroll } from '../hooks/use-calendar-scroll';
import { CalendarStripFace } from './CalendarStripFace';

interface CalendarStripProps {
  board: CalendarBoard;
  scroll: CalendarScroll;
}

export const CalendarStrip: FC<CalendarStripProps> = ({ board, scroll }) => {
  const fold = useCalendarFold(board, scroll);
  const onToday = fold.showsToday ? fold.today : undefined;
  const previousLabel = fold.open ? PREVIOUS_MONTH : PREVIOUS_WEEK;
  const nextLabel = fold.open ? NEXT_MONTH : NEXT_WEEK;
  const expandLabel = fold.open ? COLLAPSE_LABEL : EXPAND_LABEL;
  const gripLabel = fold.view === 'hours' ? CLOSE_HOURS_LABEL : expandLabel;

  return (
    <KkCalendarStrip label={STRIP_LABEL} expanded={fold.expanded}>
      <KkCalendarStrip.Bar>
        <KkCalendarStrip.Title
          title={fold.title}
          caption={fold.caption}
          todayLabel={TODAY}
          onToday={onToday}
        />
        <KkCalendarStrip.Tools>
          <KkCalendarStrip.Modes
            label={MODES_LABEL}
            labels={MODE_LABELS}
            value={fold.mode}
            onChange={fold.choose}
          />
          <KkCalendarStrip.Travel
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            onPrevious={fold.previous}
            onNext={fold.next}
          />
          <KkCalendarStrip.Expand
            label={expandLabel}
            expanded={fold.open}
            onToggle={fold.toggleMonth}
          />
        </KkCalendarStrip.Tools>
      </KkCalendarStrip.Bar>
      <KkCalendarStrip.Body face={fold.mode}>
        <CalendarStripFace board={board} scroll={scroll} fold={fold} />
      </KkCalendarStrip.Body>
      <KkCalendarStrip.Grip
        label={gripLabel}
        expanded={fold.expanded}
        onToggle={fold.toggleOpen}
        onPull={fold.pull}
      />
    </KkCalendarStrip>
  );
};
