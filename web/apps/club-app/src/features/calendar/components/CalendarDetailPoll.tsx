import { KkPollBallot } from '@furria/ui/KkPollBallot';
import type { FC } from 'react';
import { useCalendarPoll } from '../hooks/use-calendar-poll';
import type { CalendarPoll } from '../schemas';
import { CalendarCloseAction } from './CalendarCloseAction';
import type { CalendarConfirmCopy } from './CalendarConfirmDialog';
import { CalendarNotAnsweredRoll } from './CalendarNotAnsweredRoll';

const CHOICES_LABEL = 'Antworten';
const CLOSE_LABEL = 'Umfrage beenden';
const CLOSE_COPY: Omit<CalendarConfirmCopy, 'question'> = {
  eyebrow: 'UMFRAGE BEENDEN',
  explanation: 'Danach kann niemand mehr abstimmen.',
  confirmLabel: 'Beenden',
  cancelLabel: 'Offen lassen',
  closeLabel: 'Schließen',
};

interface CalendarDetailPollProps {
  poll: CalendarPoll;
  mayClose: boolean;
  mayAnswer: boolean;
}

export const CalendarDetailPoll: FC<CalendarDetailPollProps> = ({ poll, mayClose, mayAnswer }) => {
  const control = useCalendarPoll(poll, mayClose);
  const isLocked = control.isClosed || !mayAnswer;

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
      disabled={isLocked}
      onSelect={choice.choose}
    />
  ));
  const closeCopy: CalendarConfirmCopy = {
    ...CLOSE_COPY,
    question: control.closeQuestion,
  };
  const closeAction = control.canClose ? (
    <CalendarCloseAction
      label={CLOSE_LABEL}
      copy={closeCopy}
      isClosing={control.isClosing}
      onClose={control.close}
    />
  ) : null;

  const notAnswered =
    poll.notAnswered === null ? null : <CalendarNotAnsweredRoll notAnswered={poll.notAnswered} />;

  return (
    <KkPollBallot label={control.question}>
      <KkPollBallot.Head question={control.question} meta={control.meta} />
      <KkPollBallot.Choices label={CHOICES_LABEL} busy={control.isSubmitting}>
        {choices}
      </KkPollBallot.Choices>
      {notAnswered}
      {closeAction}
    </KkPollBallot>
  );
};
