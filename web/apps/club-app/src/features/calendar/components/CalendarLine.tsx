import { KkCalendarAgenda } from '@furria/ui/KkCalendarAgenda';
import { KkCoverThumb } from '@furria/ui/KkCoverThumb';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write/landing-target';
import { ATTENDANCE_LABELS, toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import type { CalendarLine as CalendarLineData } from '../calendar-agenda';
import { toBadgeSpoken } from '../calendar-agenda-copy';
import { toLineView } from '../calendar-agenda-view';
import { useCalendarLine } from '../hooks/use-calendar-line';

interface CalendarLineProps {
  line: CalendarLineData;
  nowMs: number;
  order: number;
  selected: boolean;
  highlightedKey: string | null;
  onSelect: (calendarEntryId: number) => void;
}

const LANDING_KIND = 'calendar-entry';

export const CalendarLine: FC<CalendarLineProps> = ({
  line,
  nowMs,
  order,
  selected,
  highlightedKey,
  onSelect,
}) => {
  const view = toLineView(line, nowMs);
  const landing =
    line.dayIndex === 0 ? toLandingKey(LANDING_KIND, line.entry.calendarEntryId) : undefined;
  const answer = useCalendarLine(line.entry, nowMs, line.dayIndex === 0);
  const select = (): void => {
    onSelect(line.entry.calendarEntryId);
  };
  const time = (
    <KkCalendarAgenda.Time
      main={view.time.main}
      sub={view.time.sub}
      tone={view.timeTone}
      order={order}
      accessibleLabel={view.time.spoken}
    />
  );
  const thumb =
    view.thumb === null ? null : (
      <KkCoverThumb
        image={view.thumb.image}
        tone={view.thumb.tone}
        alt=""
        size="small"
        dimmed={view.thumb.cancelledLabel !== null}
      />
    );
  const badgeSpoken =
    answer.answer === null ? '' : toBadgeSpoken(ATTENDANCE_LABELS[answer.answer], view.title);
  const badge =
    answer.state === 'badge' && answer.answer !== null ? (
      <KkCalendarAgenda.Badge
        answer={answer.answer}
        label={badgeSpoken}
        order={order}
        delayed={answer.arrivedAnswered}
        onSelect={answer.reopen}
      />
    ) : null;
  const choiceLabel = toAttendanceChoiceLabel(view.title);
  const quick =
    answer.state === 'choice' ? (
      <KkCalendarAgenda.Quick
        label={choiceLabel}
        labels={ATTENDANCE_LABELS}
        value={answer.answer}
        onChange={answer.choose}
        disabled={answer.inert}
        error={answer.error}
      />
    ) : null;
  const shownThumb = quick === null ? thumb : null;
  const trailing =
    shownThumb === null && badge === null ? undefined : (
      <>
        {badge}
        {shownThumb}
      </>
    );
  const aside = quick ?? undefined;

  return (
    <KkCalendarAgenda.Line
      kind={view.glyph}
      title={view.title}
      venue={view.venue}
      groups={view.groups}
      liveLabel={view.liveLabel}
      tone={view.mark}
      quiet={view.quiet}
      selected={selected}
      highlight={landing !== undefined && landing === highlightedKey}
      landing={landing}
      order={order}
      accessibleLabel={view.spoken}
      time={time}
      trailing={trailing}
      aside={aside}
      onSelect={select}
    />
  );
};
