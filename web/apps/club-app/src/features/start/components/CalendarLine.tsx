import { KkAnswerChoice, KkDensePanel } from '@furria/ui';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import type { CalendarLineInput } from '../hooks/use-calendar-line';
import { useCalendarLine } from '../hooks/use-calendar-line';

export const CalendarLine: FC<CalendarLineInput> = (props) => {
  const line = useCalendarLine(props);
  const { trailing } = line;

  const anchor = (
    <KkDensePanel.Stamp
      eyebrow={line.stamp.eyebrow}
      eyebrowTone={line.stamp.tone}
      time={line.stamp.time}
      live={line.running}
    />
  );

  const ring =
    trailing.kind === 'ring' ? (
      <KkDensePanel.AnswerRing
        label={line.ringLabel}
        expanded={line.choosing}
        controls={line.choiceId}
        onToggle={line.toggle}
      />
    ) : null;

  const mark =
    trailing.kind === 'mark' ? (
      <KkDensePanel.AnswerMark answer={trailing.answer} label={line.markLabel} />
    ) : null;

  const answerSlot = ring ?? mark;

  const choice = line.choosing ? (
    <KkAnswerChoice
      id={line.choiceId}
      label={line.choiceLabel}
      value={line.value}
      onChange={line.choose}
      labels={ATTENDANCE_LABELS}
    />
  ) : null;

  return (
    <KkDensePanel.Line
      anchor={anchor}
      title={props.entry.title}
      meta={line.meta}
      alert={line.alert}
      tick={line.tick}
      state={line.state}
      progress={line.progress}
      highlight={line.highlight}
      trailing={answerSlot}
      expanded={choice}
      onCollapse={line.collapse}
      accessibleLabel={line.accessibleLabel}
      onClick={line.open}
    />
  );
};
