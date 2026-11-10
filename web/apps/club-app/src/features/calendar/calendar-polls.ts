import { toDayTime, toInstant } from '@/lib/day';
import type {
  AudiencePerson,
  CalendarAddOnCardForm,
  CalendarEntryAddOn,
  CalendarPoll,
  CalendarPollForm,
  CalendarPollOptionForm,
} from './schemas';

export const POLL_QUESTION_MAX_LENGTH = 200;
export const POLL_OPTION_LABEL_MAX_LENGTH = 120;
export const POLL_OPTIONS_MIN = 2;
export const POLL_OPTIONS_MAX = 20;
const NO_DEADLINE = '';
const FULL_PERCENT = 100;

export type CalendarPollIssueCode =
  | 'questionMissing'
  | 'questionTooLong'
  | 'optionMissing'
  | 'optionTooLong'
  | 'optionRepeated'
  | 'deadlineTimeMissing'
  | 'deadlineAfterStart';

export interface CalendarPollIssue {
  code: CalendarPollIssueCode;
  path: (string | number)[];
}

export type PollFieldPath =
  | `addOns.${number}.poll.question`
  | `addOns.${number}.poll.votesUntilTime`
  | `addOns.${number}.poll.options.${number}.label`;

export type PollOptionsPath = `addOns.${number}.poll.options`;

export interface CalendarPollStart {
  day: string;
  time: string;
}

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

const toDeadlineIssues = (
  poll: CalendarPollForm,
  start: CalendarPollStart,
): CalendarPollIssueCode[] => {
  if (poll.votesUntilDay === NO_DEADLINE) {
    return [];
  }
  if (poll.votesUntilTime === NO_DEADLINE) {
    return ['deadlineTimeMissing'];
  }
  if (start.day === '' || start.time === '') {
    return [];
  }

  return `${poll.votesUntilDay}T${poll.votesUntilTime}` > `${start.day}T${start.time}`
    ? ['deadlineAfterStart']
    : [];
};

const toCardIssues = (
  poll: CalendarPollForm,
  cardIndex: number,
  start: CalendarPollStart,
): CalendarPollIssue[] => {
  const pollPath = ['addOns', cardIndex, 'poll'];
  const optionIssues = poll.options.flatMap((option, optionIndex) => {
    const code = toOptionIssue(option, poll.options.slice(0, optionIndex));

    return code === null ? [] : [{ code, path: [...pollPath, 'options', optionIndex, 'label'] }];
  });

  return [
    ...toQuestionIssues(poll).map((code) => ({ code, path: [...pollPath, 'question'] })),
    ...optionIssues,
    ...toDeadlineIssues(poll, start).map((code) => ({
      code,
      path: [...pollPath, 'votesUntilTime'],
    })),
  ];
};

export const toPollIssues = (
  cards: readonly CalendarAddOnCardForm[],
  start: CalendarPollStart,
): CalendarPollIssue[] =>
  cards.flatMap((card, cardIndex) =>
    card.kind === 'poll' ? toCardIssues(card.poll, cardIndex, start) : [],
  );

export const toDeadlinePaths = (
  cards: readonly CalendarAddOnCardForm[],
): `addOns.${number}.poll.votesUntilTime`[] =>
  cards.flatMap((card, cardIndex) => {
    const path: `addOns.${number}.poll.votesUntilTime` = `addOns.${cardIndex}.poll.votesUntilTime`;

    return card.kind === 'poll' && card.poll.votesUntilDay !== NO_DEADLINE ? [path] : [];
  });

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

const toVotesUntil = (poll: CalendarPollForm): string | null => {
  if (poll.votesUntilDay === NO_DEADLINE) {
    return null;
  }

  const held = poll.heldVotesUntil === null ? null : toDayTime(poll.heldVotesUntil);
  const isUnchanged = held?.day === poll.votesUntilDay && held.time === poll.votesUntilTime;

  return isUnchanged ? poll.heldVotesUntil : toInstant(poll.votesUntilDay, poll.votesUntilTime);
};

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
  const deadline = poll.votesUntil === null ? null : toDayTime(poll.votesUntil);

  return {
    pollId: poll.pollId,
    question: poll.question,
    allowsMultipleChoices: poll.allowsMultipleChoices,
    isAnonymous: poll.isAnonymous,
    votesUntilDay: deadline?.day ?? NO_DEADLINE,
    votesUntilTime: deadline?.time ?? NO_DEADLINE,
    heldVotesUntil: poll.votesUntil,
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
}

export const toPollFormLocks = (
  held: CalendarPoll | null,
  form: Pick<CalendarPollForm, 'options'>,
): CalendarPollFormLocks => {
  const voterCount = held?.voterCount ?? 0;
  const hasVoters = voterCount > 0;
  const votes = (held?.options ?? []).reduce((sum, option) => sum + option.voteCount, 0);

  return {
    lockedOptionIds: (held?.options ?? [])
      .filter((option) => option.voteCount > 0)
      .map((option) => option.optionId),
    isChoiceModeLocked: held?.allowsMultipleChoices === true && votes > voterCount,
    isAnonymityLocked: hasVoters && held?.isAnonymous === true,
    canRemoveOptions: form.options.length > POLL_OPTIONS_MIN,
    canAddOptions: form.options.length < POLL_OPTIONS_MAX,
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
  const most = Math.max(0, ...counts);

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
  if (day === null || day === NO_DEADLINE) {
    return { ...poll, votesUntilDay: NO_DEADLINE, votesUntilTime: NO_DEADLINE };
  }

  return {
    ...poll,
    votesUntilDay: day,
    votesUntilTime: poll.votesUntilTime === NO_DEADLINE ? fallbackTime : poll.votesUntilTime,
  };
};
