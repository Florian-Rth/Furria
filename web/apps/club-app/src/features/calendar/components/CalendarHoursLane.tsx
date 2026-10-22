import { KkCalendarHours } from '@furria/ui/KkCalendarHours';
import type { FC } from 'react';
import { toNowLabel } from '../calendar-agenda-copy';
import type { CalendarHoursLane as CalendarHoursLaneData } from '../calendar-hours-view';

interface CalendarHoursLaneProps {
  lane: CalendarHoursLaneData;
  laneIndex: number;
  nowMinute: number;
  nowClock: string;
  onPickDay: (isoDay: string) => void;
  onSelect: (id: string) => void;
}

export const CalendarHoursLane: FC<CalendarHoursLaneProps> = ({
  lane,
  laneIndex,
  nowMinute,
  nowClock,
  onPickDay,
  onSelect,
}) => {
  const { day, placement } = lane;
  const quiet = lane.quiet && !day.isToday;
  const head = <KkCalendarHours.Day day={day} quiet={quiet} onSelect={onPickDay} />;
  const blocks = placement.blocks.map((placed) => (
    <KkCalendarHours.Block
      key={placed.block.id}
      placed={placed}
      laneIndex={laneIndex}
      onSelect={onSelect}
    />
  ));
  const needle = day.isToday ? (
    <KkCalendarHours.Needle minute={nowMinute} label={toNowLabel(nowClock)} />
  ) : null;

  return (
    <KkCalendarHours.Lane
      label={day.label}
      head={head}
      rows={placement.rows}
      quiet={quiet}
      tint={lane.tint}
      selected={day.selected}
    >
      {needle}
      {blocks}
    </KkCalendarHours.Lane>
  );
};
