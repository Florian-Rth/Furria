import { KkAnswerChoice } from '@furria/ui/KkAnswerChoice';
import { KkDensePanel } from '@furria/ui/KkDensePanel';
import { KkStartTile } from '@furria/ui/KkStartTile';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import type { CalendarSheetLineInput } from '../hooks/use-calendar-sheet-line';
import { useCalendarSheetLine } from '../hooks/use-calendar-sheet-line';

export const CalendarSheetLine: FC<CalendarSheetLineInput> = (props) => {
  const line = useCalendarSheetLine(props);
  const { trailing } = line;

  const anchor = (
    <KkDensePanel.Stamp
      eyebrow={line.stamp.eyebrow}
      eyebrowTone={line.eyebrowTone}
      time={line.stamp.time}
      live={line.running}
    />
  );

  const ring =
    trailing.kind === 'ring' ? (
      <KkStartTile.AnswerToggle
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
      highlight={line.flash}
      trailing={answerSlot}
      expanded={choice}
      onCollapse={line.collapse}
      accessibleLabel={line.accessibleLabel}
      onClick={line.open}
    />
  );
};
