import { KkAnswerChoice } from '@furria/ui/KkAnswerChoice';
import { KkDensePanel } from '@furria/ui/KkDensePanel';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { ATTENDANCE_LABELS, toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import { usePassTrainingLine } from '../hooks/use-pass-training-line';
import type { PassTrainingLine as PassTrainingLineModel } from '../pass-act';
import {
  OWED_ANSWER_LABEL,
  toAnswerMarkLabel,
  toClock,
  toShortDay,
  toTrainingLineLabel,
} from '../pass-copy';
import { trainingLinkOf } from '../pass-paths';

interface PassTrainingLineProps {
  training: PassTrainingLineModel;
  answers: boolean;
}

export const PassTrainingLine: FC<PassTrainingLineProps> = ({ training, answers }) => {
  const line = usePassTrainingLine(training.calendarEntryId, training.answer);
  const link = trainingLinkOf(training.calendarEntryId);
  const value = line.value;

  const anchor = (
    <KkDensePanel.Stamp
      eyebrow={toShortDay(training.startsAt)}
      eyebrowTone="plain"
      time={toClock(training.startsAt)}
    />
  );
  const mark =
    value === null ? null : (
      <KkDensePanel.AnswerMark answer={value} label={toAnswerMarkLabel(value)} />
    );
  const ring =
    value === null || value === 'maybe' ? (
      <KkDensePanel.AnswerRing
        label={OWED_ANSWER_LABEL}
        expanded={line.choosing}
        controls={line.choiceId}
        onToggle={line.toggle}
      />
    ) : null;
  const trailing = answers ? (ring ?? mark) : null;
  const choice = line.choosing ? (
    <KkAnswerChoice
      id={line.choiceId}
      label={toAttendanceChoiceLabel(training.title)}
      value={value}
      onChange={line.choose}
      labels={ATTENDANCE_LABELS}
    />
  ) : null;

  return (
    <KkDensePanel.Line
      anchor={anchor}
      title={training.title}
      accessibleLabel={toTrainingLineLabel(training.title, training.startsAt)}
      alert={line.alert}
      trailing={trailing}
      expanded={choice}
      onCollapse={line.collapse}
      component={Link}
      to={link.to}
      search={link.search}
    />
  );
};
