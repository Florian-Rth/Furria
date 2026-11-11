import { useFormState } from 'react-hook-form';
import { nextFreshKey } from '../calendar-add-ons';
import { hasNoDeadline } from '../calendar-deadlines';
import type { CalendarFieldError } from '../calendar-field-error';
import { toFieldError } from '../calendar-field-error';
import {
  toPollCardMetaLabel,
  toPollOptionFieldLabel,
  toPollOptionRemoveLabel,
  toPollRemoveLabel,
  toVotesLabel,
} from '../calendar-labels';
import type { PollFieldPath } from '../calendar-polls';
import {
  isOptionLocked,
  toHeldPoll,
  toPollFormLocks,
  withAddedOption,
  withOptionLabel,
  withoutOption,
  withVotesUntilDay,
} from '../calendar-polls';
import type { CalendarEntry, CalendarPollForm } from '../schemas';
import type { CalendarEntryEditorControl } from './use-calendar-entry-editor';

export interface CalendarPollOptionRowControl {
  key: string;
  label: string;
  fieldName: string;
  fieldLabel: string;
  removeLabel: string;
  isLocked: boolean;
  canRemove: boolean;
  hint: string | undefined;
  error: CalendarFieldError;
  setLabel: (label: string) => void;
  remove: () => void;
}

export interface CalendarPollFieldNames {
  question: string;
  votesUntilDay: string;
  votesUntilTime: string;
}

export interface CalendarPollCardControl {
  fieldNames: CalendarPollFieldNames;
  removeLabel: string;
  metaLabel: string | undefined;
  questionError: CalendarFieldError;
  deadlineError: CalendarFieldError;
  rows: CalendarPollOptionRowControl[];
  canAddOption: boolean;
  isQuestionLocked: boolean;
  isDeadlineLocked: boolean;
  isDeadlineTimeLocked: boolean;
  isChoiceModeLocked: boolean;
  isAnonymityLocked: boolean;
  setQuestion: (question: string) => void;
  addOption: () => void;
  setMultipleChoices: (allowed: boolean) => void;
  setAnonymous: (anonymous: boolean) => void;
  setVotesUntilDay: (day: string | null) => void;
  setVotesUntilTime: (time: string) => void;
}

interface CalendarPollCardInput {
  control: CalendarEntryEditorControl;
  cardKey: string;
  index: number;
  poll: CalendarPollForm;
  entry: CalendarEntry | null;
}

export const useCalendarPollCard = ({
  control,
  cardKey,
  index,
  poll,
  entry,
}: CalendarPollCardInput): CalendarPollCardControl => {
  const questionPath = `addOns.${index}.poll.question` as const;
  const deadlinePath = `addOns.${index}.poll.votesUntilTime` as const;
  const optionsPath = `addOns.${index}.poll.options` as const;
  const formState = useFormState({ control: control.form.control, name: `addOns.${index}` });
  const errorAt = (path: PollFieldPath): CalendarFieldError =>
    toFieldError(control.form.getFieldState(path, formState).error?.message);
  const held = toHeldPoll(entry?.addOns ?? null, poll.pollId);
  const locks = toPollFormLocks(held, poll);

  const change = (edit: (current: CalendarPollForm) => CalendarPollForm): void => {
    control.updatePoll(cardKey, edit);
  };

  const rows = poll.options.map((option, optionIndex): CalendarPollOptionRowControl => {
    const isLocked = isOptionLocked(locks, option);
    const voteCount =
      held?.options.find((heldOption) => heldOption.optionId === option.optionId)?.voteCount ?? 0;
    const labelPath = `addOns.${index}.poll.options.${optionIndex}.label` as const;

    return {
      key: option.key,
      label: option.label,
      fieldName: labelPath,
      fieldLabel: toPollOptionFieldLabel(optionIndex),
      removeLabel: toPollOptionRemoveLabel(optionIndex),
      isLocked,
      canRemove: locks.canRemoveOptions && !isLocked,
      hint: isLocked ? toVotesLabel(voteCount) : undefined,
      error: errorAt(labelPath),
      setLabel: (label) => {
        change((current) => withOptionLabel(current, option.key, label));
        control.recheckPollField(labelPath);
      },
      remove: () => {
        change((current) => withoutOption(current, option.key));
        control.forgetPollErrors(optionsPath);
      },
    };
  });

  return {
    fieldNames: {
      question: questionPath,
      votesUntilDay: `addOns.${index}.poll.votesUntilDay`,
      votesUntilTime: deadlinePath,
    },
    removeLabel: toPollRemoveLabel(poll.question),
    metaLabel: toPollCardMetaLabel(held),
    questionError: errorAt(questionPath),
    deadlineError: errorAt(deadlinePath),
    rows,
    canAddOption: locks.canAddOptions,
    isQuestionLocked: locks.isQuestionLocked,
    isDeadlineLocked: locks.isDeadlineLocked,
    isDeadlineTimeLocked: hasNoDeadline(poll.votesUntilDay) || locks.isDeadlineLocked,
    isChoiceModeLocked: locks.isChoiceModeLocked,
    isAnonymityLocked: locks.isAnonymityLocked,
    setQuestion: (question) => {
      change((current) => ({ ...current, question }));
      control.recheckPollField(questionPath);
    },
    addOption: () => {
      change((current) => withAddedOption(current, nextFreshKey()));
    },
    setMultipleChoices: (allowed) => {
      change((current) => ({ ...current, allowsMultipleChoices: allowed }));
    },
    setAnonymous: (anonymous) => {
      change((current) => ({ ...current, isAnonymous: anonymous }));
    },
    setVotesUntilDay: (day) => {
      const fallbackTime = control.form.getValues('startTime');

      change((current) => withVotesUntilDay(current, day, fallbackTime));
      control.recheckPollField(deadlinePath);
    },
    setVotesUntilTime: (time) => {
      change((current) => ({ ...current, votesUntilTime: time }));
      control.recheckPollField(deadlinePath);
    },
  };
};
