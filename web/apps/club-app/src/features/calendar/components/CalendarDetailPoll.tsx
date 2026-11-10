import { KkButton } from '@furria/ui/KkButton';
import { KkPollBallot } from '@furria/ui/KkPollBallot';
import type { FC } from 'react';
import { useCalendarPoll } from '../hooks/use-calendar-poll';
import type { CalendarPoll } from '../schemas';
import { CalendarPollCloseDialog } from './CalendarPollCloseDialog';

const CHOICES_LABEL = 'Antworten';
const CLOSE_LABEL = 'Umfrage beenden';

interface CalendarDetailPollProps {
  poll: CalendarPoll;
  mayClose: boolean;
}

export const CalendarDetailPoll: FC<CalendarDetailPollProps> = ({ poll, mayClose }) => {
  const control = useCalendarPoll(poll, mayClose);

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
      disabled={control.isClosed}
      onSelect={choice.choose}
    />
  ));
  const closeButton = control.canClose ? (
    <>
      <KkButton
        variant="outlined"
        size="small"
        onClick={control.askClose}
        loading={control.isClosing}
        sx={{ alignSelf: 'flex-start' }}
      >
        {CLOSE_LABEL}
      </KkButton>
      <CalendarPollCloseDialog control={control} />
    </>
  ) : null;

  return (
    <KkPollBallot label={control.question}>
      <KkPollBallot.Head question={control.question} meta={control.meta} />
      <KkPollBallot.Choices label={CHOICES_LABEL} busy={control.isSubmitting}>
        {choices}
      </KkPollBallot.Choices>
      {closeButton}
    </KkPollBallot>
  );
};
