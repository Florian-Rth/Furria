import { KkPassCard } from '@furria/ui/KkPassCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { usePassAnswer } from '../hooks/use-pass-answer';
import {
  ANSWER_LABELS,
  NEXT_TRAINING_EYEBROW,
  OWED_TRAINING_EYEBROW,
  toAnswerLabel,
  toDayAndClock,
} from '../pass-copy';
import { trainingLinkOf } from '../pass-paths';

interface PassTrainingAnswerProps {
  calendarEntryId: number;
  startsAt: string;
  title: string | undefined;
  saved: AttendanceAnswer | null;
  actName: string;
}

export const PassTrainingAnswer: FC<PassTrainingAnswerProps> = ({
  calendarEntryId,
  startsAt,
  title,
  saved,
  actName,
}) => {
  const answer = usePassAnswer(calendarEntryId, saved);
  const link = trainingLinkOf(calendarEntryId);
  const eyebrow = answer.owed ? OWED_TRAINING_EYEBROW : NEXT_TRAINING_EYEBROW;

  return (
    <KkPassCard.Training
      eyebrow={eyebrow}
      when={toDayAndClock(startsAt)}
      title={title}
      owed={answer.owed}
      component={Link}
      to={link.to}
      search={link.search}
    >
      <KkPassCard.Answer
        label={toAnswerLabel(actName)}
        value={answer.value}
        owed={answer.owed}
        labels={ANSWER_LABELS}
        onChange={answer.choose}
        error={answer.error}
      />
    </KkPassCard.Training>
  );
};
