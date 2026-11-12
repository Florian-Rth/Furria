import type { CalendarDeadlineIssueCode, CalendarDeadlineStart } from './calendar-deadlines';
import {
  NO_DEADLINE,
  toDeadlineDayChange,
  toDeadlineFields,
  toDeadlineInstant,
  toDeadlineIssueCodes,
} from './calendar-deadlines';
import type {
  AudiencePerson,
  CalendarAddOnCardForm,
  CalendarEntryAddOn,
  CalendarPoll,
  CalendarPollForm,
  CalendarPollOption,
  CalendarPollOptionForm,
} from './schemas';

export const POLL_QUESTION_MAX_LENGTH = 200;
export const POLL_OPTION_LABEL_MAX_LENGTH = 120;
export const POLL_OPTIONS_MIN = 2;
export const POLL_OPTIONS_MAX = 20;
const FULL_PERCENT = 100;

export type CalendarPollIssueCode =
  | 'questionMissing'
  | 'questionTooLong'
  | 'optionMissing'
  | 'optionTooLong'
  | 'optionRepeated'
  | CalendarDeadlineIssueCode;

export interface CalendarPollIssue {
  code: CalendarPollIssueCode;
  path: (string | number)[];
}

export type PollFieldPath =
  | `addOns.${number}.poll.question`
  | `addOns.${number}.poll.votesUntilTime`
  | `addOns.${number}.poll.options.${number}.label`;

export type PollOptionsPath = `addOns.${number}.poll.options`;

const toQuestionIssues = (poll: CalendarPollForm): CalendarPollIssueCode[] => {
  const question = poll.question.trim();

  if (question === '') {
    return ['questionMissing'];
  }

  return question.length > POLL_QUESTION_MAX_LENGTH ? ['questionTooLong'] : [];
};

const toOptionIssue = (
  option: CalendarPollOptionForm,
  earlier: readonly CalendarPollOptionForm[],
): CalendarPollIssueCode | null => {
  const label = option.label.trim();

  if (label === '') {
    return 'optionMissing';
  }
  if (label.length > POLL_OPTION_LABEL_MAX_LENGTH) {
    return 'optionTooLong';
  }

  const folded = label.toLocaleLowerCase('de');
  const isRepeated = earlier.some((held) => held.label.trim().toLocaleLowerCase('de') === folded);

  return isRepeated ? 'optionRepeated' : null;
};

const toCardIssues = (
  poll: CalendarPollForm,
  cardIndex: number,
  start: CalendarDeadlineStart,
): CalendarPollIssue[] => {
  const pollPath = ['addOns', cardIndex, 'poll'];
  const optionIssues = poll.options.flatMap((option, optionIndex) => {
    const code = toOptionIssue(option, poll.options.slice(0, optionIndex));

    return code === null ? [] : [{ code, path: [...pollPath, 'options', optionIndex, 'label'] }];
  });

  return [
    ...toQuestionIssues(poll).map((code) => ({ code, path: [...pollPath, 'question'] })),
    ...optionIssues,
    ...toDeadlineIssueCodes({ day: poll.votesUntilDay, time: poll.votesUntilTime }, start).map(
      (code) => ({
        code,
        path: [...pollPath, 'votesUntilTime'],
      }),
    ),
  ];
};

export const toPollIssues = (
  cards: readonly CalendarAddOnCardForm[],
  start: CalendarDeadlineStart,
): CalendarPollIssue[] =>
  cards.flatMap((card, cardIndex) =>
    card.kind === 'poll' ? toCardIssues(card.poll, cardIndex, start) : [],
  );

export type CalendarPollOptionPayload = {
  optionId: number | null;
  label: string;
};

export type CalendarPollPayload = {
  pollId: number | null;
  question: string;
  allowsMultipleChoices: boolean;
  isAnonymous: boolean;
  votesUntil: string | null;
  options: CalendarPollOptionPayload[];
};

const toVotesUntil = (poll: CalendarPollForm): string | null =>
  toDeadlineInstant({
    day: poll.votesUntilDay,
    time: poll.votesUntilTime,
    held: poll.heldVotesUntil,
  });

export const toPollPayload = (poll: CalendarPollForm): CalendarPollPayload => ({
  pollId: poll.pollId,
  question: poll.question.trim(),
  allowsMultipleChoices: poll.allowsMultipleChoices,
  isAnonymous: poll.isAnonymous,
  votesUntil: toVotesUntil(poll),
  options: poll.options.map((option) => ({
    optionId: option.optionId,
    label: option.label.trim(),
  })),
});

export const toHeldOptionKey = (optionId: number): string => `option-${optionId}`;

export const toPollForm = (poll: CalendarPoll): CalendarPollForm => {
  const deadline = toDeadlineFields(poll.votesUntil);

  return {
    pollId: poll.pollId,
    question: poll.question,
    allowsMultipleChoices: poll.allowsMultipleChoices,
    isAnonymous: poll.isAnonymous,
    votesUntilDay: deadline.day,
    votesUntilTime: deadline.time,
    heldVotesUntil: deadline.held,
    options: poll.options.map((option) => ({
      key: toHeldOptionKey(option.optionId),
      optionId: option.optionId,
      label: option.label,
    })),
  };
};

export const toNewPollForm = (optionKeys: readonly [string, string]): CalendarPollForm => ({
  pollId: null,
  question: '',
  allowsMultipleChoices: false,
  isAnonymous: false,
  votesUntilDay: NO_DEADLINE,
  votesUntilTime: NO_DEADLINE,
  heldVotesUntil: null,
  options: optionKeys.map((key) => ({ key, optionId: null, label: '' })),
});

export const toHeldPoll = (
  addOns: readonly CalendarEntryAddOn[] | null,
  pollId: number | null,
): CalendarPoll | null =>
  pollId === null
    ? null
    : ((addOns ?? [])
        .flatMap((addOn) => (addOn.kind === 'poll' ? [addOn.poll] : []))
        .find((poll) => poll.pollId === pollId) ?? null);

export interface CalendarPollFormLocks {
  lockedOptionIds: number[];
  isChoiceModeLocked: boolean;
  isAnonymityLocked: boolean;
  canRemoveOptions: boolean;
  canAddOptions: boolean;
  isQuestionLocked: boolean;
  isDeadlineLocked: boolean;
}

export const toPollFormLocks = (
  held: CalendarPoll | null,
  form: Pick<CalendarPollForm, 'options'>,
): CalendarPollFormLocks => {
  const voterCount = held?.voterCount ?? 0;
  const hasVoters = voterCount > 0;
  const votes = (held?.options ?? []).reduce((sum, option) => sum + option.voteCount, 0);
  const isFrozen = held?.isClosed === true;

  return {
    lockedOptionIds: (held?.options ?? [])
      .filter((option) => isFrozen || option.voteCount > 0)
      .map((option) => option.optionId),
    isChoiceModeLocked: isFrozen || (held?.allowsMultipleChoices === true && votes > voterCount),
    isAnonymityLocked: isFrozen || (hasVoters && held?.isAnonymous === true),
    canRemoveOptions: !isFrozen && form.options.length > POLL_OPTIONS_MIN,
    canAddOptions: !isFrozen && form.options.length < POLL_OPTIONS_MAX,
    isQuestionLocked: isFrozen || hasVoters,
    isDeadlineLocked: isFrozen,
  };
};

export const isOptionLocked = (
  locks: Pick<CalendarPollFormLocks, 'lockedOptionIds'>,
  option: Pick<CalendarPollOptionForm, 'optionId'>,
): boolean => option.optionId !== null && locks.lockedOptionIds.includes(option.optionId);

export const toVoteSet = (
  chosenIds: readonly number[],
  optionId: number,
  allowsMultipleChoices: boolean,
): number[] => {
  const isChosen = chosenIds.includes(optionId);

  if (allowsMultipleChoices) {
    return isChosen ? chosenIds.filter((held) => held !== optionId) : [...chosenIds, optionId];
  }

  return isChosen && chosenIds.length === 1 ? [] : [optionId];
};

export const toViewerChoice = (poll: Pick<CalendarPoll, 'options'>): number[] =>
  poll.options.filter((option) => option.viewerChose).map((option) => option.optionId);

export interface CalendarPollResult {
  optionId: number;
  label: string;
  voteCount: number;
  percent: number;
  isLeading: boolean;
  isChosen: boolean;
  voters: AudiencePerson[];
}

const toPlainPercents = (counts: readonly number[], voterCount: number): number[] =>
  counts.map((count) => (voterCount === 0 ? 0 : Math.round((count / voterCount) * FULL_PERCENT)));

const toBalancedPercents = (counts: readonly number[], total: number): number[] => {
  if (total === 0) {
    return counts.map(() => 0);
  }

  const exact = counts.map((count) => (count / total) * FULL_PERCENT);
  const floors = exact.map((value) => Math.floor(value));
  const missing = FULL_PERCENT - floors.reduce((sum, value) => sum + value, 0);
  const raised = new Set(
    exact
      .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
      .sort((left, right) => right.remainder - left.remainder || left.index - right.index)
      .slice(0, missing)
      .map((candidate) => candidate.index),
  );

  return floors.map((value, index) => (raised.has(index) ? value + 1 : value));
};

export const toPollResults = (
  poll: Pick<CalendarPoll, 'allowsMultipleChoices' | 'voterCount' | 'options'>,
  chosenIds: readonly number[],
): CalendarPollResult[] => {
  const counts = poll.options.map((option) => option.voteCount);
  const totalVotes = counts.reduce((sum, count) => sum + count, 0);
  const percents = poll.allowsMultipleChoices
    ? toPlainPercents(counts, poll.voterCount)
    : toBalancedPercents(counts, totalVotes);
  const most = toMostVotes(poll.options);

  return poll.options.map((option, index) => ({
    optionId: option.optionId,
    label: option.label,
    voteCount: option.voteCount,
    percent: percents[index] ?? 0,
    isLeading: most > 0 && option.voteCount === most,
    isChosen: chosenIds.includes(option.optionId),
    voters: option.voters,
  }));
};

export type CalendarPollOutcome =
  | { kind: 'none' }
  | { kind: 'winner' | 'tie'; labels: string[]; count: number };

const NO_OUTCOME: CalendarPollOutcome = { kind: 'none' };

export const toMostVotes = (options: readonly Pick<CalendarPollOption, 'voteCount'>[]): number =>
  Math.max(0, ...options.map((option) => option.voteCount));

export const toPollOutcome = (
  poll: Pick<CalendarPoll, 'isClosed' | 'options'>,
): CalendarPollOutcome => {
  const most = toMostVotes(poll.options);

  if (!poll.isClosed || most === 0) {
    return NO_OUTCOME;
  }

  const labels = poll.options
    .filter((option) => option.voteCount === most)
    .map((option) => option.label);

  return { kind: labels.length === 1 ? 'winner' : 'tie', labels, count: most };
};

interface PollModeration {
  poll: Pick<CalendarPoll, 'isClosed'>;
  mayClose: boolean;
}

interface PollReopening extends PollModeration {
  reopensUntil: string | null;
  nowMs: number;
}

export const mayClosePoll = ({ poll, mayClose }: PollModeration): boolean =>
  mayClose && !poll.isClosed;

export const mayReopenPoll = ({ poll, mayClose, reopensUntil, nowMs }: PollReopening): boolean =>
  mayClose && poll.isClosed && (reopensUntil === null || nowMs < Date.parse(reopensUntil));

export const toDiscardedVoterCount = (
  addOns: readonly CalendarEntryAddOn[] | null,
  pollId: number | null,
): number => toHeldPoll(addOns, pollId)?.voterCount ?? 0;

export const withOptionLabel = (
  poll: CalendarPollForm,
  key: string,
  label: string,
): CalendarPollForm => ({
  ...poll,
  options: poll.options.map((option) => (option.key === key ? { ...option, label } : option)),
});

export const withAddedOption = (poll: CalendarPollForm, key: string): CalendarPollForm => ({
  ...poll,
  options: [...poll.options, { key, optionId: null, label: '' }],
});

export const withoutOption = (poll: CalendarPollForm, key: string): CalendarPollForm => ({
  ...poll,
  options: poll.options.filter((option) => option.key !== key),
});

export const withVotesUntilDay = (
  poll: CalendarPollForm,
  day: string | null,
  fallbackTime: string,
): CalendarPollForm => {
  const deadline = toDeadlineDayChange({ time: poll.votesUntilTime }, day, fallbackTime);

  return { ...poll, votesUntilDay: deadline.day, votesUntilTime: deadline.time };
};
