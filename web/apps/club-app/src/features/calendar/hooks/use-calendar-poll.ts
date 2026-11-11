import type { KkPollBallotMode } from '@furria/ui/KkPollBallot';
import { useMeQuery } from '@/features/session/api';
import { ATTENDANCE_ROLL_LABELS } from '@/lib/calendar-copy';
import { usePollVoteMutation } from '../api';
import { toPollMetaLabel, toPollOutcomeLabel } from '../calendar-labels';
import type { NamesTab } from '../calendar-names';
import { toNameLine, toOpenTab, toPersonEntry } from '../calendar-names';
import { toPollOutcome, toPollResults, toViewerChoice, toVoteSet } from '../calendar-polls';
import type { CalendarReminderSource } from '../calendar-reminders';
import { toPollReminderSource } from '../calendar-reminders';
import type { CalendarEntry, CalendarPoll } from '../schemas';
import type { NamesSheetControl } from './use-names-sheet';
import { useNamesSheet } from './use-names-sheet';

export interface CalendarPollChoice {
  optionId: number;
  label: string;
  count: string;
  percent: number;
  isChosen: boolean;
  isLeading: boolean;
  voters: string | undefined;
  votersMore: string | undefined;
  openVoters: (() => void) | undefined;
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
  tabs: NamesTab[];
  openTab: NamesTab | null;
  sheet: NamesSheetControl;
}

const toOptionTabId = (optionId: number): string => `option-${optionId}`;

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
  const ownPersonId = useMeQuery().data?.person?.id ?? null;
  const sheet = useNamesSheet();

  const choose = (optionId: number): void => {
    if (isLocked || isSubmitting) {
      return;
    }

    vote.mutate({
      pollId: poll.pollId,
      optionIds: toVoteSet(chosenIds, optionId, poll.allowsMultipleChoices),
    });
  };

  const results = toPollResults(poll, chosenIds);
  const optionTabs = results.map(
    (result): NamesTab => ({
      id: toOptionTabId(result.optionId),
      label: result.label,
      count: result.voteCount,
      entries: poll.isAnonymous
        ? null
        : result.voters.map((voter) => toPersonEntry(voter, ownPersonId)),
    }),
  );
  const openTab = toOpenTab(poll.notAnswered, ownPersonId, ATTENDANCE_ROLL_LABELS.open);
  const choices = results.map((result, index): CalendarPollChoice => {
    const line = toNameLine(optionTabs[index]?.entries ?? []);

    return {
      optionId: result.optionId,
      label: result.label,
      count: String(result.voteCount),
      percent: result.percent,
      isChosen: result.isChosen,
      isLeading: result.isLeading,
      voters: line?.names,
      votersMore: line?.more,
      openVoters:
        line === null
          ? undefined
          : () => {
              sheet.open(toOptionTabId(result.optionId));
            },
      choose: () => {
        choose(result.optionId);
      },
    };
  });

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
    tabs: openTab === null ? optionTabs : [...optionTabs, openTab],
    openTab,
    sheet,
  };
};
