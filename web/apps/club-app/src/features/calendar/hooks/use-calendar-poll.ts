import type { KkPollBallotMode } from '@furria/ui/KkPollBallot';
import { useState } from 'react';
import { usePollClosingMutation, usePollVoteMutation } from '../api';
import { toPollMetaLabel, toPollVotersLabel } from '../calendar-labels';
import { toPollResults, toViewerChoice, toVoteSet } from '../calendar-polls';
import type { CalendarPoll } from '../schemas';

export interface CalendarPollChoice {
  optionId: number;
  label: string;
  count: string;
  percent: number;
  isChosen: boolean;
  isLeading: boolean;
  voters: string | undefined;
  choose: () => void;
}

export interface CalendarPollControl {
  mode: KkPollBallotMode;
  question: string;
  meta: string | undefined;
  choices: CalendarPollChoice[];
  isClosed: boolean;
  isSubmitting: boolean;
  canClose: boolean;
  isClosing: boolean;
  isCloseAsked: boolean;
  askClose: () => void;
  confirmClose: () => void;
  cancelClose: () => void;
}

export const useCalendarPoll = (poll: CalendarPoll, mayClose: boolean): CalendarPollControl => {
  const vote = usePollVoteMutation();
  const closing = usePollClosingMutation();
  const [isCloseAsked, setCloseAsked] = useState(false);
  const pendingVote =
    vote.isPending && vote.variables?.pollId === poll.pollId ? vote.variables : null;
  const chosenIds = pendingVote?.optionIds ?? toViewerChoice(poll);
  const isSubmitting = vote.isPending;

  const choose = (optionId: number): void => {
    if (poll.isClosed || isSubmitting) {
      return;
    }

    vote.mutate({
      pollId: poll.pollId,
      optionIds: toVoteSet(chosenIds, optionId, poll.allowsMultipleChoices),
    });
  };

  const choices = toPollResults(poll, chosenIds).map(
    (result): CalendarPollChoice => ({
      optionId: result.optionId,
      label: result.label,
      count: String(result.voteCount),
      percent: result.percent,
      isChosen: result.isChosen,
      isLeading: result.isLeading,
      voters: poll.isAnonymous ? undefined : toPollVotersLabel(result.voters),
      choose: () => {
        choose(result.optionId);
      },
    }),
  );

  return {
    mode: poll.allowsMultipleChoices ? 'multiple' : 'single',
    question: poll.question,
    meta: toPollMetaLabel(poll),
    choices,
    isClosed: poll.isClosed,
    isSubmitting,
    canClose: mayClose && !poll.isClosed,
    isClosing: closing.isPending,
    isCloseAsked,
    askClose: () => {
      setCloseAsked(true);
    },
    confirmClose: () => {
      setCloseAsked(false);
      closing.mutate({ pollId: poll.pollId });
    },
    cancelClose: () => {
      setCloseAsked(false);
    },
  };
};
