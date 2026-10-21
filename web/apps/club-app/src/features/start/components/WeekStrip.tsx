import { KkWeekStrip } from '@furria/ui';
import type { FC } from 'react';
import type { StripCell } from '../hooks/use-week-strip';
import { STRIP_LABEL } from '../week-strip-labels';

interface WeekStripProps {
  cells: readonly StripCell[];
}

export const WeekStrip: FC<WeekStripProps> = ({ cells }) => {
  const days = cells.map(({ day, face, marks: shownMarks, select }) => {
    const marks = shownMarks.map(({ mark, more }, markIndex) => (
      <KkWeekStrip.Mark
        key={mark.calendarEntryId}
        kind={mark.kind}
        state={mark.state}
        dayIndex={day.dayIndex}
        markIndex={markIndex}
        time={mark.time}
        more={more}
      />
    ));

    return (
      <KkWeekStrip.Day
        key={day.key}
        weekday={face.weekday}
        number={face.number}
        tone={face.tone}
        index={day.dayIndex}
        label={face.label}
        marks={marks}
        overflow={face.overflow}
        onSelect={select}
      />
    );
  });

  return <KkWeekStrip label={STRIP_LABEL} days={days} />;
};
