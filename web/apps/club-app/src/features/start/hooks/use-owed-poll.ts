import type { KkPollBallotMode } from '@furria/ui/KkPollBallot';
import { useState } from 'react';
import { usePollVoteMutation } from '@/features/calendar/api';
import { toVoteSet } from '@/features/calendar/calendar-polls';
import type { StartEntry, StartPoll } from '../schemas';
import { itemKeyOf } from '../start-visit';
import type { StartBoard } from './use-start-view';

const ANONYMOUS_LABEL = 'Anonym';

export interface OwedPollChoiceView {
  optionId: number;
  label: string;
  chosen: boolean;
  choose: () => void;
}

export interface OwedPollView {
  mode: KkPollBallotMode;
  question: string;
  meta: string | undefined;
  choices: OwedPollChoiceView[];
  isBusy: boolean;
}

const chosenIdsOf = (poll: StartPoll): number[] =>
  poll.options.filter((option) => option.viewerChose).map((option) => option.optionId);

export const useOwedPoll = (
  entry: StartEntry,
  poll: StartPoll,
  board: StartBoard,
): OwedPollView => {
  const vote = usePollVoteMutation();
  const [sent, setSent] = useState<{ basis: StartPoll; optionIds: number[] } | null>(null);
  const awaitsFresh = sent !== null && sent.basis === poll && !vote.isError;
  const chosenIds = awaitsFresh ? sent.optionIds : chosenIdsOf(poll);
  const isBusy = vote.isPending;

  const choose = (optionId: number): void => {
    if (isBusy) {
      return;
    }

    const optionIds = toVoteSet(chosenIds, optionId, poll.allowsMultipleChoices);

    board.touch(itemKeyOf({ panel: 'calendar', calendarEntryId: entry.calendarEntryId }));
    setSent({ basis: poll, optionIds });
    vote.mutate({ pollId: poll.pollId, optionIds });
  };

  return {
    mode: poll.allowsMultipleChoices ? 'multiple' : 'single',
    question: poll.question,
    meta: poll.isAnonymous ? ANONYMOUS_LABEL : undefined,
    choices: poll.options.map((option) => ({
      optionId: option.optionId,
      label: option.label,
      chosen: chosenIds.includes(option.optionId),
      choose: () => {
        choose(option.optionId);
      },
    })),
    isBusy,
  };
};
