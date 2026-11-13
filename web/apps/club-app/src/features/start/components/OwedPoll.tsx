import { KkPollBallot } from '@furria/ui/KkPollBallot';
import type { FC } from 'react';
import { useOwedPoll } from '../hooks/use-owed-poll';
import type { StartBoard } from '../hooks/use-start-view';
import type { OwedHost } from '../owed-items';
import type { StartPoll } from '../schemas';

interface OwedPollProps {
  host: OwedHost;
  poll: StartPoll;
  board: StartBoard;
}

export const OwedPoll: FC<OwedPollProps> = ({ host, poll, board }) => {
  const ballot = useOwedPoll(host, poll, board);

  const choices = ballot.choices.map((choice) => (
    <KkPollBallot.Choice
      key={choice.optionId}
      mode={ballot.mode}
      label={choice.label}
      chosen={choice.chosen}
      disabled={ballot.isBusy}
      onSelect={choice.choose}
    />
  ));

  return (
    <KkPollBallot label={ballot.question}>
      <KkPollBallot.Head question={ballot.question} meta={ballot.meta} heading="h3" />
      <KkPollBallot.Choices label={ballot.question} busy={ballot.isBusy}>
        {choices}
      </KkPollBallot.Choices>
    </KkPollBallot>
  );
};
