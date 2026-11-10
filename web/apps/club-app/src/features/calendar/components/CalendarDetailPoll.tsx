import { KkPollBallot } from '@furria/ui/KkPollBallot';
import type { FC } from 'react';
import { useCalendarPoll } from '../hooks/use-calendar-poll';
import type { CalendarPoll } from '../schemas';
import { CalendarCloseAction } from './CalendarCloseAction';
import { CalendarNotAnsweredRoll } from './CalendarNotAnsweredRoll';

const CHOICES_LABEL = 'Antworten';
const CLOSE_LABEL = 'Umfrage beenden';

interface CalendarDetailPollProps {
  poll: CalendarPoll;
  mayClose: boolean;
  mayAnswer: boolean;
}

export const CalendarDetailPoll: FC<CalendarDetailPollProps> = ({ poll, mayClose, mayAnswer }) => {
  const control = useCalendarPoll(poll, mayClose, mayAnswer);

  const choices = control.choices.map((choice) => (
    <KkPollBallot.Choice
      key={choice.optionId}
      mode={control.mode}
      label={choice.label}
      count={choice.count}
      percent={choice.percent}
      chosen={choice.isChosen}
      leading={choice.isLeading}
      voters={choice.voters}
      disabled={control.isLocked}
      readOnly={control.isReadOnly}
      onSelect={choice.choose}
    />
  ));
  const closeAction = control.canClose ? (
    <CalendarCloseAction
      label={CLOSE_LABEL}
      copy={control.closeCopy}
      isClosing={control.isClosing}
      onClose={control.close}
    />
  ) : null;

  return (
    <KkPollBallot label={control.question}>
      <KkPollBallot.Head question={control.question} meta={control.meta} />
      <KkPollBallot.Choices label={CHOICES_LABEL} busy={control.isSubmitting}>
        {choices}
      </KkPollBallot.Choices>
      <CalendarNotAnsweredRoll label={control.question} notAnswered={poll.notAnswered} />
      {closeAction}
    </KkPollBallot>
  );
};
