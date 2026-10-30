import { KkAgenda } from '@furria/ui/KkAgenda';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { AgendaTraining } from '../act-agenda';
import {
  NO_LABEL,
  toAnswerGroupLabel,
  toDay,
  toLongDate,
  toMarkLabel,
  toTrainingLine,
  toWeekday,
  YES_LABEL,
} from '../agenda-copy';
import { useAgendaAnswer } from '../hooks/use-agenda-answer';

interface AgendaTrainingRowProps {
  training: AgendaTraining;
  order: number;
  current: boolean;
  showsDate: boolean;
  answers: boolean;
  showsTally: boolean;
  to: string;
  search?: Record<string, string | number>;
}

export const AgendaTrainingRow: FC<AgendaTrainingRowProps> = ({
  training,
  order,
  current,
  showsDate,
  answers,
  showsTally,
  to,
  search,
}) => {
  const answer = useAgendaAnswer(training.calendarEntryId, training.answer);
  const owed = answers && answer.value === null;
  const markOf = current ? 'current' : 'none';
  const mark = owed && !current ? 'owed' : markOf;
  const weekday = toWeekday(training.startsAt);
  const day = toDay(training.startsAt);
  const dateLabel = toLongDate(training.startsAt);
  const markLabel = toMarkLabel(current, owed);
  const line = toTrainingLine(training, showsTally);
  const groupLabel = toAnswerGroupLabel(training);
  const toggles = answers ? (
    <KkAgenda.Answer
      label={groupLabel}
      yesLabel={YES_LABEL}
      noLabel={NO_LABEL}
      value={answer.value}
      onChange={answer.choose}
      error={answer.error}
    />
  ) : null;

  return (
    <KkAgenda.Row
      weekday={weekday}
      day={day}
      dateLabel={dateLabel}
      mark={mark}
      markLabel={markLabel}
      order={order}
      showsDate={showsDate}
    >
      <KkAgenda.Fact title={training.title} line={line} component={Link} to={to} search={search} />
      {toggles}
    </KkAgenda.Row>
  );
};
