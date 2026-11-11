import type { KkPollBallotMode } from '@furria/ui/KkPollBallot';
import { usePollVoteMutation } from '../api';
import { toPollMetaLabel, toPollOutcomeLabel, toPollVotersLabel } from '../calendar-labels';
import { toPollOutcome, toPollResults, toViewerChoice, toVoteSet } from '../calendar-polls';
import type { CalendarReminderSource } from '../calendar-reminders';
import { toPollReminderSource } from '../calendar-reminders';
import type { CalendarEntry, CalendarPoll } from '../schemas';

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
  outcome: string | undefined;
  choices: CalendarPollChoice[];
  isLocked: boolean;
  isReadOnly: boolean;
  isSubmitting: boolean;
  reminder: CalendarReminderSource;
}

export const useCalendarPoll = (
  poll: CalendarPoll,
  entry: Pick<CalendarEntry, 'calendarEntryId' | 'mayAnswer'>,
): CalendarPollControl => {
  const mayAnswer = entry.mayAnswer;
  const vote = usePollVoteMutation();
  const pendingVote =
    vote.isPending && vote.variables?.pollId === poll.pollId ? vote.variables : null;
  const chosenIds = pendingVote?.optionIds ?? toViewerChoice(poll);
  const isSubmitting = vote.isPending;
  const isLocked = poll.isClosed || !mayAnswer;

  const choose = (optionId: number): void => {
    if (isLocked || isSubmitting) {
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
    reminder: toPollReminderSource(entry.calendarEntryId, poll),
    mode: poll.allowsMultipleChoices ? 'multiple' : 'single',
    question: poll.question,
    meta: toPollMetaLabel(poll),
    outcome: toPollOutcomeLabel(toPollOutcome(poll)),
    choices,
    isLocked,
    isReadOnly: isLocked,
    isSubmitting,
  };
};
