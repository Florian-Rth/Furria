import { KkPollBallot } from '@furria/ui/KkPollBallot';
import type { FC } from 'react';
import { useCalendarPoll } from '../hooks/use-calendar-poll';
import { useCalendarPollClosing } from '../hooks/use-calendar-poll-closing';
import type { CalendarPoll } from '../schemas';
import { CalendarCloseAction } from './CalendarCloseAction';
import { CalendarNotAnsweredRoll } from './CalendarNotAnsweredRoll';
import { CalendarReopenAction } from './CalendarReopenAction';

const CHOICES_LABEL = 'Antworten';
const CLOSE_LABEL = 'Umfrage beenden';
const ACTION_SX = { alignSelf: 'flex-start' } as const;

interface CalendarDetailPollProps {
  poll: CalendarPoll;
  mayClose: boolean;
  mayAnswer: boolean;
  entryStartsAt: string;
}

export const CalendarDetailPoll: FC<CalendarDetailPollProps> = ({
  poll,
  mayClose,
  mayAnswer,
  entryStartsAt,
}) => {
  const control = useCalendarPoll(poll, mayAnswer);
  const closing = useCalendarPollClosing({ poll, mayClose, startsAt: entryStartsAt });

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
  const closeAction = closing.canClose ? (
    <CalendarCloseAction
      label={CLOSE_LABEL}
      copy={closing.closeCopy}
      isClosing={closing.isClosing}
      onClose={closing.close}
    />
  ) : null;
  const reopenAction = closing.canReopen ? (
    <CalendarReopenAction
      isReopening={closing.isReopening}
      onReopen={closing.reopen}
      sx={ACTION_SX}
    />
  ) : null;
  const outcome =
    control.outcome === undefined ? null : <KkPollBallot.Outcome text={control.outcome} />;

  return (
    <KkPollBallot label={control.question}>
      <KkPollBallot.Head question={control.question} meta={control.meta} />
      {outcome}
      <KkPollBallot.Choices label={CHOICES_LABEL} busy={control.isSubmitting}>
        {choices}
      </KkPollBallot.Choices>
      <CalendarNotAnsweredRoll label={control.question} notAnswered={poll.notAnswered} />
      {closeAction}
      {reopenAction}
    </KkPollBallot>
  );
};
